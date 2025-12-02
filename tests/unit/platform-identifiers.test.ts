import { describe, it, expect } from 'vitest';
import { 
  validatePSNID, 
  validateXboxGamertag,
  validatePlayerIdentifier,
  getPlayerIdPlaceholder,
  getPlayerIdLabel,
  getPlayerIdError,
  PSN_PLATFORM,
  XBOX_PLATFORM
} from '@/lib/validation/player-id';

describe('validatePSNID', () => {
  it('should accept valid PSN IDs', () => {
    expect(validatePSNID('PlayerName123')).toBe(true);
    expect(validatePSNID('Player_Name')).toBe(true);
    expect(validatePSNID('Player-Name')).toBe(true);
    expect(validatePSNID('Player_Name-123')).toBe(true);
    expect(validatePSNID('abc')).toBe(true); // minimum length
    expect(validatePSNID('1234567890123456')).toBe(true); // maximum length (16 chars)
  });

  it('should reject invalid PSN IDs', () => {
    expect(validatePSNID('ab')).toBe(false); // too short
    expect(validatePSNID('12345678901234567')).toBe(false); // too long (17 chars)
    expect(validatePSNID('-PlayerName')).toBe(false); // starts with hyphen
    expect(validatePSNID('PlayerName-')).toBe(false); // ends with hyphen
    expect(validatePSNID('_PlayerName')).toBe(false); // starts with underscore
    expect(validatePSNID('PlayerName_')).toBe(false); // ends with underscore
    expect(validatePSNID('Player Name')).toBe(false); // contains space
    expect(validatePSNID('Player@Name')).toBe(false); // contains invalid character
    expect(validatePSNID('Player#Name')).toBe(false); // contains hash
  });
});

describe('validateXboxGamertag', () => {
  it('should accept valid Xbox Gamertags', () => {
    expect(validateXboxGamertag('PlayerName123')).toBe(true);
    expect(validateXboxGamertag('Player Name')).toBe(true); // spaces allowed
    expect(validateXboxGamertag('P')).toBe(true); // minimum length
    expect(validateXboxGamertag('PlayerName12345')).toBe(true); // 15 chars
    expect(validateXboxGamertag('PlayerName#1234')).toBe(true); // new format with suffix
    expect(validateXboxGamertag('Player Name#99')).toBe(true); // spaces + suffix
  });

  it('should reject invalid Xbox Gamertags', () => {
    expect(validateXboxGamertag(' PlayerName')).toBe(false); // starts with space
    expect(validateXboxGamertag('PlayerName ')).toBe(false); // ends with space
    expect(validateXboxGamertag('Player-Name')).toBe(false); // contains hyphen
    expect(validateXboxGamertag('Player_Name')).toBe(false); // contains underscore
    expect(validateXboxGamertag('PlayerName@123')).toBe(false); // contains invalid character
    expect(validateXboxGamertag('PlayerName#')).toBe(false); // hash without numbers
    expect(validateXboxGamertag('PlayerName#12345')).toBe(false); // suffix too long
    expect(validateXboxGamertag('PlayerNameTooLong123')).toBe(false); // over 20 chars total
  });
});

describe('validatePlayerIdentifier', () => {
  it('should validate PSN IDs correctly', () => {
    expect(validatePlayerIdentifier('PlayerName123', PSN_PLATFORM)).toBe(true);
    expect(validatePlayerIdentifier('ab', PSN_PLATFORM)).toBe(false);
    expect(validatePlayerIdentifier('-Invalid', PSN_PLATFORM)).toBe(false);
  });

  it('should validate Xbox Gamertags correctly', () => {
    expect(validatePlayerIdentifier('PlayerName', XBOX_PLATFORM)).toBe(true);
    expect(validatePlayerIdentifier('Player Name', XBOX_PLATFORM)).toBe(true);
    expect(validatePlayerIdentifier(' Invalid', XBOX_PLATFORM)).toBe(false);
  });

  it('should use generic validation for other games', () => {
    expect(validatePlayerIdentifier('PlayerName123', 'tarkov')).toBe(true);
    expect(validatePlayerIdentifier('P', 'tarkov')).toBe(false); // too short
    expect(validatePlayerIdentifier('a'.repeat(65), 'tarkov')).toBe(false); // too long
  });
});

describe('getPlayerIdPlaceholder', () => {
  it('should return correct placeholder for PSN', () => {
    expect(getPlayerIdPlaceholder(PSN_PLATFORM)).toBe('PSN_Username');
  });

  it('should return correct placeholder for Xbox', () => {
    expect(getPlayerIdPlaceholder(XBOX_PLATFORM)).toBe('GamerTag or GamerTag#1234');
  });

  it('should return generic placeholder for other games', () => {
    expect(getPlayerIdPlaceholder('tarkov')).toBe('PlayerName123');
  });
});

describe('getPlayerIdLabel', () => {
  it('should return correct label for PSN', () => {
    expect(getPlayerIdLabel(PSN_PLATFORM)).toBe('PSN ID');
  });

  it('should return correct label for Xbox', () => {
    expect(getPlayerIdLabel(XBOX_PLATFORM)).toBe('Xbox Gamertag');
  });

  it('should return generic label for other games', () => {
    expect(getPlayerIdLabel('tarkov')).toBe('Player identifier');
  });
});

describe('getPlayerIdError', () => {
  it('should return correct error for PSN', () => {
    const error = getPlayerIdError(PSN_PLATFORM);
    expect(error).toContain('PSN ID');
    expect(error).toContain('3-16 characters');
  });

  it('should return correct error for Xbox', () => {
    const error = getPlayerIdError(XBOX_PLATFORM);
    expect(error).toContain('Xbox Gamertag');
    expect(error).toContain('1-15 characters');
  });

  it('should return generic error for other games', () => {
    const error = getPlayerIdError('tarkov');
    expect(error).toContain('2 and 64 characters');
  });
});
