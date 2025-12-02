/**
 * Player identifier validation utilities
 * Handles various platform-specific identifier formats
 */

// Games that use EmbarkID format (PlayerName#1234)
export const EMBARK_ID_GAMES = ['the-finals', 'arc-raiders'];

// Platform identifiers
export const PSN_PLATFORM = 'psn';
export const XBOX_PLATFORM = 'xbox';

/**
 * Validates EmbarkID format: PlayerName#1234
 * Requires at least one character before # and at least one digit after
 * 
 * @param identifier - The player identifier to validate
 * @returns True if valid EmbarkID format, false otherwise
 * @example
 * validateEmbarkID("Agent932#9153") // true
 * validateEmbarkID("Agent932") // false
 * validateEmbarkID("#1234") // false
 */
export function validateEmbarkID(identifier: string): boolean {
  const embarkIdPattern = /^.+#\d+$/;
  return embarkIdPattern.test(identifier);
}

/**
 * Validates PSN ID format
 * - 3-16 characters
 * - Can contain letters, numbers, hyphens, and underscores
 * - Cannot start or end with hyphen or underscore
 * 
 * @param identifier - The PSN ID to validate
 * @returns True if valid PSN ID format, false otherwise
 * @example
 * validatePSNID("PlayerName123") // true
 * validatePSNID("Player_Name-123") // true
 * validatePSNID("ab") // false (too short)
 * validatePSNID("-PlayerName") // false (starts with hyphen)
 */
export function validatePSNID(identifier: string): boolean {
  // PSN IDs: 3-16 characters, alphanumeric plus hyphen/underscore, cannot start/end with special chars
  const psnPattern = /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,14}[a-zA-Z0-9]$/;
  return psnPattern.test(identifier);
}

/**
 * Validates Xbox Gamertag format
 * - 1-15 characters (new format) or 1-12 characters (classic)
 * - Can contain letters, numbers, and spaces
 * - Cannot start or end with a space
 * - Modern gamertags can include Unicode characters
 * 
 * @param identifier - The Xbox Gamertag to validate
 * @returns True if valid Xbox Gamertag format, false otherwise
 * @example
 * validateXboxGamertag("PlayerName123") // true
 * validateXboxGamertag("Player Name") // true
 * validateXboxGamertag("PlayerName#1234") // true (new format with discriminator)
 */
export function validateXboxGamertag(identifier: string): boolean {
  // Xbox Gamertags: 1-15 characters for new format (can include #1234 suffix)
  // Allow letters, numbers, spaces (not at start/end)
  // Modern format can have suffix like #1234
  
  // Check length first (1-20 chars to account for suffix)
  if (identifier.length < 1 || identifier.length > 20) {
    return false;
  }
  
  // Single character gamertag (just a letter or number)
  if (identifier.length === 1) {
    return /^[a-zA-Z0-9]$/.test(identifier);
  }
  
  // Multi-character with optional suffix
  const xboxPattern = /^[a-zA-Z0-9][a-zA-Z0-9 ]{0,13}[a-zA-Z0-9](#\d{1,4})?$/;
  return xboxPattern.test(identifier);
}

/**
 * Validates player identifier based on game/platform requirements
 * 
 * @param identifier - The player identifier to validate
 * @param gameSlug - The game slug to determine validation rules
 * @returns True if valid for the game/platform, false otherwise
 */
export function validatePlayerIdentifier(identifier: string, gameSlug: string): boolean {
  if (EMBARK_ID_GAMES.includes(gameSlug)) {
    return validateEmbarkID(identifier);
  }
  
  if (gameSlug === PSN_PLATFORM) {
    return validatePSNID(identifier);
  }
  
  if (gameSlug === XBOX_PLATFORM) {
    return validateXboxGamertag(identifier);
  }
  
  // Generic validation for other games
  return identifier.length >= 2 && identifier.length <= 64;
}

/**
 * Get placeholder text for player identifier input based on game/platform
 * 
 * @param gameSlug - The game slug
 * @returns Appropriate placeholder text
 */
export function getPlayerIdPlaceholder(gameSlug: string): string {
  if (EMBARK_ID_GAMES.includes(gameSlug)) {
    return 'PlayerName#1234';
  }
  
  if (gameSlug === PSN_PLATFORM) {
    return 'PSN_Username';
  }
  
  if (gameSlug === XBOX_PLATFORM) {
    return 'GamerTag or GamerTag#1234';
  }
  
  return 'PlayerName123';
}

/**
 * Get label text for player identifier input based on game/platform
 * 
 * @param gameSlug - The game slug
 * @returns Appropriate label text
 */
export function getPlayerIdLabel(gameSlug: string): string {
  if (EMBARK_ID_GAMES.includes(gameSlug)) {
    return 'EmbarkID';
  }
  
  if (gameSlug === PSN_PLATFORM) {
    return 'PSN ID';
  }
  
  if (gameSlug === XBOX_PLATFORM) {
    return 'Xbox Gamertag';
  }
  
  return 'Player identifier';
}

/**
 * Get validation error message for invalid player identifier
 * 
 * @param gameSlug - The game slug
 * @returns Appropriate error message
 */
export function getPlayerIdError(gameSlug: string): string {
  if (EMBARK_ID_GAMES.includes(gameSlug)) {
    return 'Invalid EmbarkID format. Must be in the format: PlayerName#1234';
  }
  
  if (gameSlug === PSN_PLATFORM) {
    return 'Invalid PSN ID. Must be 3-16 characters (letters, numbers, hyphens, underscores) and cannot start/end with special characters';
  }
  
  if (gameSlug === XBOX_PLATFORM) {
    return 'Invalid Xbox Gamertag. Must be 1-15 characters (letters, numbers, spaces) or include #1234 for new format';
  }
  
  return 'Player identifier must be between 2 and 64 characters';
}
