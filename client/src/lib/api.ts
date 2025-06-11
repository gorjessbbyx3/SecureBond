import { queryClient } from './queryClient';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear auth cache on 401
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
    
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new ApiError(errorMessage, response.status, response);
  }

  try {
    return await response.json();
  } catch {
    return null as T;
  }
}

export const api = {
  get: <T>(endpoint: string) => apiCall<T>(endpoint),
  post: <T>(endpoint: string, data?: any) => 
    apiCall<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: <T>(endpoint: string, data?: any) =>
    apiCall<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  patch: <T>(endpoint: string, data?: any) =>
    apiCall<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(endpoint: string) =>
    apiCall<T>(endpoint, { method: 'DELETE' }),
};