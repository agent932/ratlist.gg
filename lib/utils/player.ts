/**
 * Format player ID by removing everything after # symbol
 * Example: "Agent932#9153" -> "Agent932"
 * @param playerId - The full player ID
 * @param showFull - If true, shows the full name (for owner contexts)
 */
export function formatPlayerName(playerId: string, showFull: boolean = false): string {
  if (showFull) {
    return playerId;
  }
  const hashIndex = playerId.indexOf('#');
  return hashIndex !== -1 ? playerId.substring(0, hashIndex) : playerId;
}
