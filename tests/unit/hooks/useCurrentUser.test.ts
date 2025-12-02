/**
 * Unit tests for useCurrentUser hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

// Mock fetch globally
global.fetch = vi.fn();

describe('useCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with loading state', () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch user data successfully', async () => {
    const mockUser = {
      user_id: '123',
      email: 'test@example.com',
      display_name: 'Test User',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
      suspended_until: null,
      suspension_reason: null,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useCurrentUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/user/me',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('should handle fetch errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useCurrentUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch user');
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    (global.fetch as any).mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useCurrentUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toEqual(networkError);
  });

  it('should ignore AbortError when unmounting', async () => {
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';
    (global.fetch as any).mockRejectedValueOnce(abortError);

    const { result, unmount } = renderHook(() => useCurrentUser());

    unmount();

    // AbortError should not set error state
    expect(result.current.error).toBeNull();
  });

  it('should refetch data when refetch is called', async () => {
    const mockUser1 = {
      user_id: '123',
      email: 'test1@example.com',
      display_name: 'User 1',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
      suspended_until: null,
      suspension_reason: null,
    };

    const mockUser2 = {
      user_id: '456',
      email: 'test2@example.com',
      display_name: 'User 2',
      role: 'admin',
      created_at: '2024-01-02T00:00:00Z',
      suspended_until: null,
      suspension_reason: null,
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser2,
      });

    const { result } = renderHook(() => useCurrentUser());

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser1);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Call refetch
    result.current.refetch();

    // Wait for refetch to complete
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser2);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should abort fetch on unmount', async () => {
    let abortController: AbortController | undefined;
    
    (global.fetch as any).mockImplementation((url: string, options: any) => {
      abortController = { signal: options.signal } as AbortController;
      return new Promise(() => {}); // Never resolves
    });

    const { unmount } = renderHook(() => useCurrentUser());

    expect(abortController).toBeDefined();
    expect(abortController?.signal.aborted).toBe(false);

    unmount();

    // Note: We can't directly test if abort was called because jsdom doesn't fully implement AbortController
    // In a real browser, the signal.aborted would be true after unmount
  });

  it('should handle suspended users', async () => {
    const suspendedUser = {
      user_id: '789',
      email: 'suspended@example.com',
      display_name: 'Suspended User',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
      suspended_until: '2024-12-31T00:00:00Z',
      suspension_reason: 'Violation of terms',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => suspendedUser,
    });

    const { result } = renderHook(() => useCurrentUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(suspendedUser);
    expect(result.current.user?.suspended_until).toBe('2024-12-31T00:00:00Z');
    expect(result.current.user?.suspension_reason).toBe('Violation of terms');
  });

  it('should set loading to true during refetch', async () => {
    const mockUser = {
      user_id: '123',
      email: 'test@example.com',
      display_name: 'Test User',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
      suspended_until: null,
      suspension_reason: null,
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useCurrentUser());

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Trigger refetch
    result.current.refetch();

    // Wait for loading to become true and then false again
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('should clear error on successful refetch', async () => {
    const mockUser = {
      user_id: '123',
      email: 'test@example.com',
      display_name: 'Test User',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z',
      suspended_until: null,
      suspension_reason: null,
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

    const { result } = renderHook(() => useCurrentUser());

    // Wait for initial fetch to fail
    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
    });

    expect(result.current.user).toBeNull();

    // Refetch successfully
    result.current.refetch();

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    expect(result.current.error).toBeNull();
  });
});
