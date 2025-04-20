import { CollectionsResponse, SearchResponse } from '../types/index.js';

const RAINDROP_API_BASE = 'https://api.raindrop.io/rest/v1';

export class RaindropAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: string = 'GET',
    body?: unknown
  ): Promise<T> {
    const response = await fetch(`${RAINDROP_API_BASE}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Raindrop API error: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async createBookmark(params: {
    link: string;
    title?: string;
    tags?: string[];
    collection?: { $id: number };
  }) {
    return this.makeRequest<{ item: { link: string } }>('/raindrop', 'POST', params);
  }

  async searchBookmarks(
    collectionId: number,
    searchParams: URLSearchParams
  ): Promise<SearchResponse> {
    return this.makeRequest<SearchResponse>(
      `/raindrops/${collectionId}?${searchParams.toString()}`
    );
  }

  async listCollections(): Promise<CollectionsResponse> {
    return this.makeRequest<CollectionsResponse>('/collections');
  }
}
