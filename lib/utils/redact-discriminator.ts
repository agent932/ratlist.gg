/**
 * Redacts discriminator (#1234) from player identifiers per Constitution Principle VI
 * 
 * @param playerIdentifier - Player name potentially containing discriminator (e.g., "PlayerName#1234")
 * @returns Player name with discriminator stripped (e.g., "PlayerName")
 * 
 * @example
 * redactDiscriminator("TacticalGamer#1234") // Returns "TacticalGamer"
 * redactDiscriminator("PlayerWithoutTag") // Returns "PlayerWithoutTag"
 */
export function redactDiscriminator(playerIdentifier: string): string {
  // Remove #XXXX pattern (discriminator) from the end of player identifier
  return playerIdentifier.replace(/#\d{4}$/, '');
}
