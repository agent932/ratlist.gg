/**
 * Unit tests for API client utility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch, apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('apiFetch', () => {
    it('should make a successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await apiFetch('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual({ success: true, data: mockData });
    });

    it('should make a successful POST request with body', async () => {
      const mockData = { success: true };
      const postBody = { name: 'New Item' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockData,
      });

      const result = await apiFetch('/api/items', {
        method: 'POST',
        body: postBody,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/items',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postBody),
        })
      );
      expect(result).toEqual({ success: true, data: mockData });
    });

    it('should return error for non-ok response', async () => {
      const errorMessage = 'Not Found';
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: errorMessage }),
      });

      const result = await apiFetch('/api/missing');

      expect(result).toEqual({
        success: false,
        error: {
          error: errorMessage,
          message: 'HTTP 404',
          details: undefined,
        },
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiFetch('/api/test');

      expect(result).toEqual({
        success: false,
        error: {
          error: 'Network error',
          message: 'Network error',
        },
      });
    });

    it('should merge custom headers with default headers', async () => {
      const mockData = { success: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      await apiFetch('/api/test', {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value',
          },
        })
      );
    });

    it('should handle AbortError', async () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      (global.fetch as any).mockRejectedValueOnce(abortError);

      const result = await apiFetch('/api/test');

      expect(result).toEqual({
        success: false,
        error: {
          error: 'Request aborted',
          message: 'The request was cancelled',
        },
      });
    });
  });

  describe('apiGet', () => {
    it('should make a GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await apiGet('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual({ success: true, data: mockData });
    });

    it('should accept custom options', async () => {
      const mockData = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      await apiGet('/api/test', {
        headers: { 'X-Custom': 'value' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-Custom': 'value',
          }),
        })
      );
    });
  });

  describe('apiPost', () => {
    it('should make a POST request with data', async () => {
      const mockResponse = { id: 1, created: true };
      const postData = { name: 'New Item', value: 42 };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await apiPost('/api/items', postData);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/items',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
      expect(result).toEqual({ success: true, data: mockResponse });
    });

    it('should handle POST request with undefined body', async () => {
      const mockResponse = { success: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiPost('/api/action', undefined);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/action',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual({ success: true, data: mockResponse });
    });

    it('should merge custom options', async () => {
      const mockResponse = { success: true };
      const postData = { value: 123 };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await apiPost('/api/test', postData, {
        headers: { 'X-Custom': 'header' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Custom': 'header',
          }),
          body: JSON.stringify(postData),
        })
      );
    });
  });

  describe('apiPatch', () => {
    it('should make a PATCH request with data', async () => {
      const mockResponse = { id: 1, updated: true };
      const patchData = { name: 'Updated Item' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiPatch('/api/items/1', patchData);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/items/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(patchData),
        })
      );
      expect(result).toEqual({ success: true, data: mockResponse });
    });

    it('should handle PATCH request with undefined body', async () => {
      const mockResponse = { success: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiPatch('/api/items/1', undefined);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/items/1',
        expect.objectContaining({
          method: 'PATCH',
        })
      );
      expect(result).toEqual({ success: true, data: mockResponse });
    });
  });

  describe('apiDelete', () => {
    it('should make a DELETE request', async () => {
      const mockResponse = { deleted: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiDelete('/api/items/1');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/items/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual({ success: true, data: mockResponse });
    });

    it('should accept custom options', async () => {
      const mockResponse = { deleted: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await apiDelete('/api/items/1', {
        headers: { 'X-Confirm': 'true' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/items/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'X-Confirm': 'true',
          }),
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should handle JSON parsing errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await apiGet('/api/test');

      expect(result).toEqual({
        success: false,
        error: {
          error: 'Network error',
          message: 'Invalid JSON',
        },
      });
    });

    it('should handle 4xx errors with custom error message', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid input', message: 'Bad request message' }),
      });

      const result = await apiPost('/api/test', {});

      expect(result).toEqual({
        success: false,
        error: {
          error: 'Invalid input',
          message: 'Bad request message',
          details: undefined,
        },
      });
    });

    it('should handle 5xx errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      });

      const result = await apiGet('/api/test');

      expect(result).toEqual({
        success: false,
        error: {
          error: 'Server error',
          message: 'HTTP 500',
          details: undefined,
        },
      });
    });

    it('should provide default error message when none provided', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}),
      });

      const result = await apiGet('/api/test');

      expect(result).toEqual({
        success: false,
        error: {
          error: 'Request failed',
          message: 'HTTP 404',
          details: undefined,
        },
      });
    });
  });
});
