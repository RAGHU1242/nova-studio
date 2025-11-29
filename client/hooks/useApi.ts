import { useAuth } from "./useAuth";

export function useApi() {
  const request = async <T,>(
    endpoint: string,
    options: RequestInit & { method?: string } = {}
  ): Promise<T> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add existing headers
    if (options.headers && typeof options.headers === "object") {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
      credentials: "include", // Important: include cookies in all requests
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  };

  return { request };
}
