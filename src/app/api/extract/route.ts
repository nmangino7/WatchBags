import { NextRequest, NextResponse } from 'next/server';
import { extractListingFromContent } from '@/lib/ai/analyze';

function stripHtmlToText(html: string): string {
  // Remove script and style tags with content
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body as { url?: string };

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: url' },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!parsedUrl.protocol.startsWith('http')) {
        throw new Error('Not HTTP');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL. Please provide a valid http or https URL.' },
        { status: 400 }
      );
    }

    // Fetch the page
    let pageHtml: string;
    try {
      const response = await fetch(parsedUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WatchBags/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Could not fetch the page (HTTP ${response.status}). The site may be blocking automated requests. Try manual entry instead.` },
          { status: 422 }
        );
      }

      pageHtml = await response.text();
    } catch (fetchError) {
      return NextResponse.json(
        { error: 'Could not fetch the page. The site may be blocking automated requests or the URL is unreachable. Try manual entry instead.' },
        { status: 422 }
      );
    }

    // Strip HTML to plain text
    const pageText = stripHtmlToText(pageHtml);

    if (pageText.length < 50) {
      return NextResponse.json(
        { error: 'The page appears to be empty or requires JavaScript to load. Try manual entry instead.' },
        { status: 422 }
      );
    }

    // Send to Claude for extraction
    const extracted = await extractListingFromContent(pageText, url);

    if (extracted.brand === 'Unknown' || extracted.askingPrice <= 0) {
      return NextResponse.json(
        {
          error: 'Could not identify a luxury watch or handbag listing on this page. Try manual entry instead.',
          partial: extracted,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      extracted,
      sourceUrl: url,
    });
  } catch (error) {
    console.error('Extract API error:', error);
    return NextResponse.json(
      { error: 'Failed to extract listing data. Try manual entry instead.' },
      { status: 500 }
    );
  }
}
