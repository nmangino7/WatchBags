export interface ListingData {
  source: string;
  sourceUrl: string;
  brand: string;
  model: string;
  referenceNumber?: string;
  askingPrice: number;
  condition: 'mint' | 'excellent' | 'good' | 'fair';
  seller?: string;
  imageUrl?: string;
}

export interface PriceDataPoint {
  source: string;
  price: number;
  date: Date;
  type: 'listing' | 'sold';
}

export interface DataProvider {
  name: string;
  fetchListings(category: 'watch' | 'handbag', brands?: string[]): Promise<ListingData[]>;
  fetchPriceHistory(brand: string, model: string): Promise<PriceDataPoint[]>;
}
