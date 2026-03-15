import Anthropic from '@anthropic-ai/sdk';
import type { AiAnalysis, Confidence } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface AnalyzeItemInput {
  brand: string;
  model: string;
  referenceNumber?: string;
  askingPrice: number;
  condition: string;
  comparablePrices: number[];
  recentSales: number[];
  msrp: number;
  typicalResaleLow: number;
  typicalResaleHigh: number;
}

interface ClaudeAnalysisResponse {
  fairMarketValue: number;
  confidence: string;
  reasoning: string;
  redFlags: string[];
  marketOutlook: string;
  estimatedProfit: {
    gross: number;
    fees: number;
    net: number;
    roi: number;
  };
}

// ============================================================================
// Fallback analysis using pure math
// ============================================================================

export function calculateFallbackAnalysis(input: AnalyzeItemInput): AiAnalysis {
  const allPrices = [...input.comparablePrices, ...input.recentSales];

  let fairMarketValue: number;
  if (allPrices.length > 0) {
    const sorted = [...allPrices].sort((a, b) => a - b);
    // Use trimmed mean: drop lowest and highest if we have enough data
    const trimmed =
      sorted.length >= 4
        ? sorted.slice(1, sorted.length - 1)
        : sorted;
    fairMarketValue = Math.round(
      trimmed.reduce((sum, p) => sum + p, 0) / trimmed.length
    );
  } else {
    fairMarketValue = Math.round(
      (input.typicalResaleLow + input.typicalResaleHigh) / 2
    );
  }

  const grossProfit = fairMarketValue - input.askingPrice;
  const estimatedFeeRate = 0.13; // ~13% average platform fees
  const fees = Math.round(fairMarketValue * estimatedFeeRate);
  const netProfit = grossProfit - fees;
  const roiNumber =
    input.askingPrice > 0
      ? Math.round((netProfit / input.askingPrice) * 1000) / 10
      : 0;
  const roi = `${roiNumber}%`;

  // Determine confidence based on data availability
  let confidence: Confidence;
  if (allPrices.length >= 6) {
    confidence = 'high';
  } else if (allPrices.length >= 3) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Detect red flags
  const redFlags: string[] = [];
  if (input.askingPrice < input.typicalResaleLow * 0.7) {
    redFlags.push(
      'Price is significantly below typical resale range - verify authenticity'
    );
  }
  if (input.condition === 'fair' && input.askingPrice > input.typicalResaleHigh) {
    redFlags.push('Overpriced for fair condition');
  }
  if (allPrices.length < 3) {
    redFlags.push('Limited comparable data available');
  }

  // Simple market outlook based on recent vs. older prices
  let marketOutlook: string;
  if (input.recentSales.length >= 2 && input.comparablePrices.length >= 2) {
    const avgRecent =
      input.recentSales.reduce((s, p) => s + p, 0) / input.recentSales.length;
    const avgComps =
      input.comparablePrices.reduce((s, p) => s + p, 0) /
      input.comparablePrices.length;
    if (avgRecent > avgComps * 1.05) {
      marketOutlook = 'rising';
    } else if (avgRecent < avgComps * 0.95) {
      marketOutlook = 'declining';
    } else {
      marketOutlook = 'stable';
    }
  } else {
    marketOutlook = 'stable';
  }

  // Build reasoning
  const reasoning = [
    `Based on ${allPrices.length} comparable data points, the estimated fair market value is $${fairMarketValue.toLocaleString()}.`,
    `The asking price of $${input.askingPrice.toLocaleString()} is ${
      grossProfit > 0
        ? `$${grossProfit.toLocaleString()} below`
        : `$${Math.abs(grossProfit).toLocaleString()} above`
    } the estimated fair market value.`,
    `Typical resale range for this model is $${input.typicalResaleLow.toLocaleString()} - $${input.typicalResaleHigh.toLocaleString()}.`,
    `MSRP is $${input.msrp.toLocaleString()}.`,
    `After estimated platform fees of ~$${fees.toLocaleString()} (${Math.round(estimatedFeeRate * 100)}%), the net profit would be approximately $${netProfit.toLocaleString()}.`,
  ].join(' ');

  return {
    fairMarketValue,
    confidence,
    reasoning,
    redFlags,
    marketOutlook,
    profitEstimate: {
      gross: grossProfit,
      fees,
      net: netProfit,
      roi,
    },
  };
}

// ============================================================================
// Claude AI analysis
// ============================================================================

export async function analyzeItem(itemData: AnalyzeItemInput): Promise<AiAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn(
      'ANTHROPIC_API_KEY not set, using fallback mathematical analysis.'
    );
    return calculateFallbackAnalysis(itemData);
  }

  const client = new Anthropic({ apiKey });

  const prompt = `You are a luxury goods pricing expert specializing in watches and handbags for the resale market. Analyze the following item and provide a fair market value assessment.

## Item Details
- **Brand:** ${itemData.brand}
- **Model:** ${itemData.model}
${itemData.referenceNumber ? `- **Reference Number:** ${itemData.referenceNumber}` : ''}
- **Asking Price:** $${itemData.askingPrice.toLocaleString()}
- **Condition:** ${itemData.condition}

## Market Data
- **MSRP:** $${itemData.msrp.toLocaleString()}
- **Typical Resale Range:** $${itemData.typicalResaleLow.toLocaleString()} - $${itemData.typicalResaleHigh.toLocaleString()}
- **Comparable Listing Prices:** ${itemData.comparablePrices.length > 0 ? itemData.comparablePrices.map((p) => `$${p.toLocaleString()}`).join(', ') : 'No data'}
- **Recent Sold Prices:** ${itemData.recentSales.length > 0 ? itemData.recentSales.map((p) => `$${p.toLocaleString()}`).join(', ') : 'No data'}

## Instructions
Assess the following and respond ONLY with a valid JSON object (no markdown code fences, no extra text):

1. **fairMarketValue** (number): Your estimated fair market value in USD.
2. **confidence** (string): "high", "medium", or "low" based on data quality and certainty.
3. **reasoning** (string): A detailed explanation of your valuation including references to the data provided. Mention specific comparable prices and how condition affects value.
4. **redFlags** (string[]): Any concerns about the listing (e.g., price too good to be true, condition claims, market risks). Empty array if none.
5. **marketOutlook** (string): "rising", "stable", or "declining" for this specific model's market.
6. **estimatedProfit** (object):
   - **gross** (number): fairMarketValue minus askingPrice
   - **fees** (number): estimated platform selling fees (~13% of sale price)
   - **net** (number): gross minus fees
   - **roi** (number): net profit as percentage of asking price

Respond with this exact JSON structure:
{
  "fairMarketValue": 0,
  "confidence": "high",
  "reasoning": "...",
  "redFlags": [],
  "marketOutlook": "stable",
  "estimatedProfit": {
    "gross": 0,
    "fees": 0,
    "net": 0,
    "roi": 0
  }
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      console.error('No text content in Claude response');
      return calculateFallbackAnalysis(itemData);
    }

    // Extract JSON from response (handle potential markdown fences)
    let jsonText = textBlock.text.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    const parsed: ClaudeAnalysisResponse = JSON.parse(jsonText);

    // Validate and normalize the response
    const confidence = (['high', 'medium', 'low'].includes(parsed.confidence)
      ? parsed.confidence
      : 'medium') as Confidence;

    const marketOutlook = ['rising', 'stable', 'declining'].includes(
      parsed.marketOutlook
    )
      ? parsed.marketOutlook
      : 'stable';

    return {
      fairMarketValue: Math.round(parsed.fairMarketValue),
      confidence,
      reasoning: parsed.reasoning || 'No reasoning provided.',
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
      marketOutlook,
      profitEstimate: {
        gross: Math.round(parsed.estimatedProfit?.gross ?? 0),
        fees: Math.round(parsed.estimatedProfit?.fees ?? 0),
        net: Math.round(parsed.estimatedProfit?.net ?? 0),
        roi: `${Math.round((parseFloat(String(parsed.estimatedProfit?.roi ?? 0))) * 10) / 10}%`,
      },
    };
  } catch (error) {
    console.error('Claude API analysis failed, using fallback:', error);
    return calculateFallbackAnalysis(itemData);
  }
}
