/**
 * Games that use EmbarkID format (PlayerName#1234)
 */
export const EMBARK_ID_GAMES = ['the-finals', 'arc-raiders'];

/**
 * Validate EmbarkID format: PlayerName#1234
 * Must have at least one character before # and at least one digit after
 * 
 * @param value - The player identifier to validate
 * @returns true if valid EmbarkID format, false otherwise
 * 
 * @example
 * validateEmbarkID('Player#1234') // true
 * validateEmbarkID('TestUser#9999') // true
 * validateEmbarkID('Invalid') // false
 * validateEmbarkID('#1234') // false
 * validateEmbarkID('Player#') // false
 */
export function validateEmbarkID(value: string): boolean {
  const embarkIdPattern = /^.+#\d+$/;
  return embarkIdPattern.test(value);
}
