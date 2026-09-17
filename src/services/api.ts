export interface ApiClient {
  get<TResponse>(url: string): Promise<TResponse>;
}

/**
 * Shared, typed boundary for HTTP integrations.
 */
export const api: ApiClient = {
  async get<TResponse>(url: string): Promise<TResponse> {
    const response: Response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed with status ${String(response.status)}`);
    }

    return response.json() as Promise<TResponse>;
  },
};
