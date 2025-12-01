import { describe, it, expect } from 'vitest';
import { scoreFromCounts, tierFromScore, DEFAULT_WEIGHTS } from '@/lib/reputation';

describe('reputation scoring', () => {
  describe('scoreFromCounts', () => {
    it('should calculate score with default weights', () => {
      const counts = { betrayal: 2, 'clutch-save': 1 };
      const score = scoreFromCounts(counts);
      // 2 * -5 + 1 * 3 = -10 + 3 = -7
      expect(score).toBe(-7);
    });

    it('should handle empty counts', () => {
      expect(scoreFromCounts({})).toBe(0);
    });

    it('should ignore unknown categories', () => {
      const counts = { unknown: 5, betrayal: 1 };
      const score = scoreFromCounts(counts);
      // 1 * -5 = -5 (unknown is 0)
      expect(score).toBe(-5);
    });

    it('should use custom weights', () => {
      const counts = { custom: 2 };
      const weights = { custom: 10 };
      const score = scoreFromCounts(counts, weights);
      expect(score).toBe(20);
    });
  });

  describe('tierFromScore', () => {
    it('should return F for very negative scores', () => {
      expect(tierFromScore(-50)).toBe('F');
      expect(tierFromScore(-20)).toBe('F');
    });

    it('should return D for moderately negative scores', () => {
      expect(tierFromScore(-19)).toBe('D');
      expect(tierFromScore(-10)).toBe('D');
    });

    it('should return C for slightly negative scores', () => {
      expect(tierFromScore(-9)).toBe('C');
      expect(tierFromScore(-3)).toBe('C');
    });

    it('should return B for neutral scores', () => {
      expect(tierFromScore(-2)).toBe('B');
      expect(tierFromScore(0)).toBe('B');
      expect(tierFromScore(2)).toBe('B');
    });

    it('should return A for positive scores', () => {
      expect(tierFromScore(3)).toBe('A');
      expect(tierFromScore(9)).toBe('A');
    });

    it('should return S for very positive scores', () => {
      expect(tierFromScore(10)).toBe('S');
      expect(tierFromScore(100)).toBe('S');
    });
  });
});
