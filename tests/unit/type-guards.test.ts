/**
 * Unit tests for runtime type guards
 */

import { describe, it, expect } from 'vitest';
import {
  isUserRole,
  isIncidentStatus,
  isIncidentSeverity,
  isFlagResolution,
  isPlayerTier,
  isUserProfile,
  isIncident,
  isApiError,
  isSuccessResponse,
  safeJsonParse,
  assertType,
} from '@/lib/type-guards';

describe('Type Guards', () => {
  describe('isUserRole', () => {
    it('should return true for valid user roles', () => {
      expect(isUserRole('user')).toBe(true);
      expect(isUserRole('moderator')).toBe(true);
      expect(isUserRole('admin')).toBe(true);
    });

    it('should return false for invalid user roles', () => {
      expect(isUserRole('superadmin')).toBe(false);
      expect(isUserRole('guest')).toBe(false);
      expect(isUserRole('')).toBe(false);
      expect(isUserRole(null)).toBe(false);
      expect(isUserRole(123)).toBe(false);
    });
  });

  describe('isIncidentStatus', () => {
    it('should return true for valid incident statuses', () => {
      expect(isIncidentStatus('active')).toBe(true);
      expect(isIncidentStatus('removed')).toBe(true);
      expect(isIncidentStatus('pending')).toBe(true);
    });

    it('should return false for invalid incident statuses', () => {
      expect(isIncidentStatus('archived')).toBe(false);
      expect(isIncidentStatus('deleted')).toBe(false);
      expect(isIncidentStatus(null)).toBe(false);
    });
  });

  describe('isIncidentSeverity', () => {
    it('should return true for valid severities', () => {
      expect(isIncidentSeverity('low')).toBe(true);
      expect(isIncidentSeverity('medium')).toBe(true);
      expect(isIncidentSeverity('high')).toBe(true);
    });

    it('should return false for invalid severities', () => {
      expect(isIncidentSeverity('critical')).toBe(false);
      expect(isIncidentSeverity('LOW')).toBe(false);
      expect(isIncidentSeverity(null)).toBe(false);
    });
  });

  describe('isFlagResolution', () => {
    it('should return true for valid flag resolutions', () => {
      expect(isFlagResolution('open')).toBe(true);
      expect(isFlagResolution('approved')).toBe(true);
      expect(isFlagResolution('dismissed')).toBe(true);
    });

    it('should return false for invalid flag resolutions', () => {
      expect(isFlagResolution('pending')).toBe(false);
      expect(isFlagResolution('rejected')).toBe(false);
    });
  });

  describe('isPlayerTier', () => {
    it('should return true for valid player tiers', () => {
      expect(isPlayerTier('S')).toBe(true);
      expect(isPlayerTier('A')).toBe(true);
      expect(isPlayerTier('B')).toBe(true);
      expect(isPlayerTier('C')).toBe(true);
      expect(isPlayerTier('D')).toBe(true);
      expect(isPlayerTier('F')).toBe(true);
    });

    it('should return false for invalid player tiers', () => {
      expect(isPlayerTier('E')).toBe(false);
      expect(isPlayerTier('s')).toBe(false);
      expect(isPlayerTier('SS')).toBe(false);
    });
  });

  describe('isUserProfile', () => {
    const validProfile = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      display_name: 'TestUser',
      role: 'user' as const,
      created_at: '2025-01-01T00:00:00Z',
      suspended_until: null,
      suspension_reason: null,
    };

    it('should return true for valid user profile', () => {
      expect(isUserProfile(validProfile)).toBe(true);
    });

    it('should accept null display_name', () => {
      expect(isUserProfile({ ...validProfile, display_name: null })).toBe(true);
    });

    it('should accept suspended user', () => {
      expect(isUserProfile({
        ...validProfile,
        suspended_until: '2025-12-31T00:00:00Z',
        suspension_reason: 'Violation of terms',
      })).toBe(true);
    });

    it('should return false for invalid user profile', () => {
      expect(isUserProfile(null)).toBe(false);
      expect(isUserProfile({})).toBe(false);
      expect(isUserProfile({ ...validProfile, user_id: 123 })).toBe(false);
      expect(isUserProfile({ ...validProfile, role: 'invalid' })).toBe(false);
    });
  });

  describe('isIncident', () => {
    const validIncident = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      player_id: 'Player#1234',
      game_id: '123e4567-e89b-12d3-a456-426614174001',
      category_name: 'Betrayal',
      severity: 'high' as const,
      description: 'Test incident description',
      status: 'active' as const,
      reporter_user_id: '123e4567-e89b-12d3-a456-426614174002',
      created_at: '2025-01-01T00:00:00Z',
    };

    it('should return true for valid incident', () => {
      expect(isIncident(validIncident)).toBe(true);
    });

    it('should return false for invalid incident', () => {
      expect(isIncident(null)).toBe(false);
      expect(isIncident({})).toBe(false);
      expect(isIncident({ ...validIncident, severity: 'critical' })).toBe(false);
      expect(isIncident({ ...validIncident, status: 'archived' })).toBe(false);
    });
  });

  describe('isApiError', () => {
    it('should return true for valid API error', () => {
      expect(isApiError({ error: 'Something went wrong' })).toBe(true);
      expect(isApiError({ error: 'Not found', message: 'Resource not found' })).toBe(true);
    });

    it('should return false for invalid API error', () => {
      expect(isApiError(null)).toBe(false);
      expect(isApiError({})).toBe(false);
      expect(isApiError({ message: 'Error' })).toBe(false);
    });
  });

  describe('isSuccessResponse', () => {
    it('should return true for successful responses', () => {
      expect(isSuccessResponse(new Response(null, { status: 200 }))).toBe(true);
      expect(isSuccessResponse(new Response(null, { status: 201 }))).toBe(true);
      expect(isSuccessResponse(new Response(null, { status: 299 }))).toBe(true);
    });

    it('should return false for error responses', () => {
      expect(isSuccessResponse(new Response(null, { status: 400 }))).toBe(false);
      expect(isSuccessResponse(new Response(null, { status: 404 }))).toBe(false);
      expect(isSuccessResponse(new Response(null, { status: 500 }))).toBe(false);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse and validate valid JSON', () => {
      const json = JSON.stringify({ error: 'Test error' });
      const result = safeJsonParse(json, isApiError);
      expect(result).toEqual({ error: 'Test error' });
    });

    it('should return null for invalid JSON', () => {
      const result = safeJsonParse('invalid json', isApiError);
      expect(result).toBe(null);
    });

    it('should return null when validation fails', () => {
      const json = JSON.stringify({ message: 'No error field' });
      const result = safeJsonParse(json, isApiError);
      expect(result).toBe(null);
    });
  });

  describe('assertType', () => {
    it('should return data when validation passes', () => {
      const data = { error: 'Test error' };
      const result = assertType(data, isApiError);
      expect(result).toEqual(data);
    });

    it('should throw error when validation fails', () => {
      const data = { message: 'No error field' };
      expect(() => assertType(data, isApiError)).toThrow('Type assertion failed');
    });

    it('should throw custom error message', () => {
      const data = { message: 'No error field' };
      expect(() => assertType(data, isApiError, 'Custom error')).toThrow('Custom error');
    });
  });
});
