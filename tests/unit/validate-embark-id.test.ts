/**
 * Unit tests for EmbarkID validation utility
 */

import { describe, it, expect } from 'vitest';
import { EMBARK_ID_GAMES, validateEmbarkID } from '@/lib/utils/validate-embark-id';

describe('validateEmbarkID', () => {
  describe('EMBARK_ID_GAMES constant', () => {
    it('should contain expected games', () => {
      expect(EMBARK_ID_GAMES).toContain('the-finals');
      expect(EMBARK_ID_GAMES).toContain('arc-raiders');
      expect(EMBARK_ID_GAMES).toHaveLength(2);
    });
  });

  describe('validateEmbarkID function', () => {
    it('should validate correct EmbarkID format', () => {
      expect(validateEmbarkID('Player#1234')).toBe(true);
      expect(validateEmbarkID('TestUser#9999')).toBe(true);
      expect(validateEmbarkID('Agent932#9153')).toBe(true);
      expect(validateEmbarkID('A#1')).toBe(true);
    });

    it('should accept multiple digits after hash', () => {
      expect(validateEmbarkID('User#1')).toBe(true);
      expect(validateEmbarkID('User#12')).toBe(true);
      expect(validateEmbarkID('User#123')).toBe(true);
      expect(validateEmbarkID('User#123456789')).toBe(true);
    });

    it('should accept special characters before hash', () => {
      expect(validateEmbarkID('User_Name#1234')).toBe(true);
      expect(validateEmbarkID('User-Name#1234')).toBe(true);
      expect(validateEmbarkID('User.Name#1234')).toBe(true);
      expect(validateEmbarkID('[Clan]Player#1234')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(validateEmbarkID('Player')).toBe(false); // No hash
      expect(validateEmbarkID('#1234')).toBe(false); // No name before hash
      expect(validateEmbarkID('Player#')).toBe(false); // No digits after hash
      expect(validateEmbarkID('Player#abcd')).toBe(false); // Letters after hash
      expect(validateEmbarkID('Player#12ab')).toBe(false); // Mixed letters and digits
      expect(validateEmbarkID('')).toBe(false); // Empty string
    });

    it('should allow multiple hashes (regex allows .+ before final #)', () => {
      // Current regex: /^.+#\d+$/ allows multiple # in the name part
      expect(validateEmbarkID('Player#12#34')).toBe(true); // Matches .+#\d+ with "Player#12" as name
      expect(validateEmbarkID('Player##1234')).toBe(true); // Matches with "Player#" as name
    });

    it('should handle edge cases', () => {
      expect(validateEmbarkID('1#1')).toBe(true); // Numbers before hash
      expect(validateEmbarkID('中文#1234')).toBe(true); // Unicode characters
      expect(validateEmbarkID('Player #1234')).toBe(true); // Space before hash
      expect(validateEmbarkID('Player# 1234')).toBe(false); // Space after hash
    });
  });
});
