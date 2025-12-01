/**
 * Player identifier validation utilities
 * Handles EmbarkID format validation for games like The Finals and Arc Raiders
 */

// Games that use EmbarkID format (PlayerName#1234)
export const EMBARK_ID_GAMES = ['the-finals', 'arc-raiders'];

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
 * Validates player identifier based on game requirements
 * 
 * @param identifier - The player identifier to validate
 * @param gameSlug - The game slug to determine validation rules
 * @returns True if valid for the game, false otherwise
 */
export function validatePlayerIdentifier(identifier: string, gameSlug: string): boolean {
  if (EMBARK_ID_GAMES.includes(gameSlug)) {
    return validateEmbarkID(identifier);
  }
  
  // Generic validation for other games
  return identifier.length >= 2 && identifier.length <= 64;
}

/**
 * Get placeholder text for player identifier input based on game
 * 
 * @param gameSlug - The game slug
 * @returns Appropriate placeholder text
 */
export function getPlayerIdPlaceholder(gameSlug: string): string {
  if (EMBARK_ID_GAMES.includes(gameSlug)) {
    return 'PlayerName#1234';
  }
  return 'PlayerName123';
}

/**
 * Get label text for player identifier input based on game
 * 
 * @param gameSlug - The game slug
 * @returns Appropriate label text
 */
export function getPlayerIdLabel(gameSlug: string): string {
  if (EMBARK_ID_GAMES.includes(gameSlug)) {
    return 'EmbarkID';
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
  return 'Player identifier must be between 2 and 64 characters';
}
