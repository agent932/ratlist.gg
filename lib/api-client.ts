/**
 * Type-safe API client utilities for making requests with proper error handling.
 * Provides consistent error handling and type validation across all API calls.
 */

import type { ApiError } from './types';

/**
 * Options for API fetch requests.
 */
export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  /**
   * Optional AbortSignal for request cancellation
   */
  signal?: AbortSignal;
  
  /**
   * Request body (will be JSON stringified)
   */
  body?: unknown;
}

/**
 * Result type for API requests - either success with data or error.
 */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

/**
 * Type-safe wrapper around fetch for API requests.
 * Automatically handles JSON serialization, error responses, and type validation.
 * 
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise resolving to ApiResult with typed data
 * 
 * @example
 * const result = await apiFetch<UserProfile>('/api/user/me');
 * if (result.success) {
 *   console.log(result.data.display_name);
 * } else {
 *   console.error(result.error.message);
 * }
 */
export async function apiFetch<T>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<ApiResult<T>> {
  try {
    const { body, headers = {}, ...restOptions } = options;
    
    const response = await fetch(url, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          error: data.error || 'Request failed',
          message: data.message || `HTTP ${response.status}`,
          details: data.details,
        },
      };
    }

    return { success: true, data };
  } catch (error) {
    // Handle network errors, AbortErrors, etc.
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: {
          error: 'Request aborted',
          message: 'The request was cancelled',
        },
      };
    }

    return {
      success: false,
      error: {
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    };
  }
}

/**
 * Create an AbortController with optional timeout.
 * Useful for setting request timeouts.
 * 
 * @param timeoutMs - Timeout in milliseconds (optional)
 * @returns AbortController instance
 * 
 * @example
 * const controller = createAbortController(5000); // 5 second timeout
 * const result = await apiFetch('/api/data', { signal: controller.signal });
 */
export function createAbortController(timeoutMs?: number): AbortController {
  const controller = new AbortController();
  
  if (timeoutMs) {
    setTimeout(() => controller.abort(), timeoutMs);
  }
  
  return controller;
}

/**
 * Helper for GET requests.
 * 
 * @param url - The API endpoint URL
 * @param options - Additional fetch options
 * @returns Promise resolving to ApiResult with typed data
 */
export async function apiGet<T>(
  url: string,
  options?: Omit<ApiFetchOptions, 'method' | 'body'>
): Promise<ApiResult<T>> {
  return apiFetch<T>(url, { ...options, method: 'GET' });
}

/**
 * Helper for POST requests.
 * 
 * @param url - The API endpoint URL
 * @param body - Request body data
 * @param options - Additional fetch options
 * @returns Promise resolving to ApiResult with typed data
 */
export async function apiPost<T>(
  url: string,
  body: unknown,
  options?: Omit<ApiFetchOptions, 'method' | 'body'>
): Promise<ApiResult<T>> {
  return apiFetch<T>(url, { ...options, method: 'POST', body });
}

/**
 * Helper for PATCH requests.
 * 
 * @param url - The API endpoint URL
 * @param body - Request body data
 * @param options - Additional fetch options
 * @returns Promise resolving to ApiResult with typed data
 */
export async function apiPatch<T>(
  url: string,
  body: unknown,
  options?: Omit<ApiFetchOptions, 'method' | 'body'>
): Promise<ApiResult<T>> {
  return apiFetch<T>(url, { ...options, method: 'PATCH', body });
}

/**
 * Helper for DELETE requests.
 * 
 * @param url - The API endpoint URL
 * @param options - Additional fetch options
 * @returns Promise resolving to ApiResult with typed data
 */
export async function apiDelete<T>(
  url: string,
  options?: Omit<ApiFetchOptions, 'method' | 'body'>
): Promise<ApiResult<T>> {
  return apiFetch<T>(url, { ...options, method: 'DELETE' });
}
