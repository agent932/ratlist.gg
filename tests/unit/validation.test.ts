import { describe, it, expect } from 'vitest';
import { IncidentInput } from '@/lib/validation/incident';
import { PlayerSearchInput } from '@/lib/validation/search';

describe('validation schemas', () => {
  describe('IncidentInput', () => {
    it('should validate a complete incident', () => {
      const input = {
        game_id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'test-player',
        category_id: 1,
        occurred_at: new Date().toISOString(),
        description: 'This is a valid description that is long enough to pass validation.',
        region: 'US-East',
        mode: 'Duos',
        map: 'Customs',
        is_anonymous: false,
      };

      const result = IncidentInput.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject description that is too short', () => {
      const input = {
        game_id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'test-player',
        category_id: 1,
        occurred_at: new Date().toISOString(),
        description: 'Short',
      };

      const result = IncidentInput.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject description that is too long', () => {
      const input = {
        game_id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'test-player',
        category_id: 1,
        occurred_at: new Date().toISOString(),
        description: 'x'.repeat(2001),
      };

      const result = IncidentInput.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields as undefined', () => {
      const input = {
        game_id: '123e4567-e89b-12d3-a456-426614174000',
        identifier: 'test-player',
        category_id: 1,
        description: 'Valid description that meets the minimum length requirement.',
      };

      const result = IncidentInput.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('PlayerSearchInput', () => {
    it('should validate search with game and identifier', () => {
      const input = {
        game: 'tarkov',
        q: 'player-name',
      };

      const result = PlayerSearchInput.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject empty identifier', () => {
      const input = {
        game: 'tarkov',
        q: '',
      };

      const result = PlayerSearchInput.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject missing game', () => {
      const input = {
        q: 'player-name',
      };

      const result = PlayerSearchInput.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
