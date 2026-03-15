import type { DataProvider, ListingData, PriceDataPoint } from './types';
import { mockProvider } from './mock-provider';

// ============================================================================
// Provider Registry
// ============================================================================

class ProviderRegistry {
  private providers: DataProvider[] = [];

  registerProvider(provider: DataProvider): void {
    const existing = this.providers.find((p) => p.name === provider.name);
    if (existing) {
      return;
    }
    this.providers.push(provider);
  }

  getProviders(): DataProvider[] {
    return [...this.providers];
  }

  async fetchAllListings(
    category: 'watch' | 'handbag',
    brands?: string[]
  ): Promise<ListingData[]> {
    const results = await Promise.allSettled(
      this.providers.map((provider) => provider.fetchListings(category, brands))
    );

    const allListings: ListingData[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allListings.push(...result.value);
      } else {
        console.error('Provider failed to fetch listings:', result.reason);
      }
    }

    return allListings;
  }

  async fetchAllPriceHistory(
    brand: string,
    model: string
  ): Promise<PriceDataPoint[]> {
    const results = await Promise.allSettled(
      this.providers.map((provider) => provider.fetchPriceHistory(brand, model))
    );

    const allPoints: PriceDataPoint[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allPoints.push(...result.value);
      } else {
        console.error('Provider failed to fetch price history:', result.reason);
      }
    }

    return allPoints.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}

// ============================================================================
// Singleton with default mock provider
// ============================================================================

const registry = new ProviderRegistry();
registry.registerProvider(mockProvider);

export const providerRegistry = registry;
export { ProviderRegistry };
