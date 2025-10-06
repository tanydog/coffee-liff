export class ApiClient {
  constructor({ baseUrl, tokenProvider } = {}) {
    this.baseUrl = baseUrl;
    this.tokenProvider = tokenProvider;
  }

  async request(path, { method = "GET", body, headers = {}, auth = true } = {}) {
    if (!this.baseUrl) {
      throw new Error("API base URL is not configured");
    }
    const requestHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
    if (auth && this.tokenProvider) {
      const token = await this.tokenProvider();
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${response.status}: ${text}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  }
}
