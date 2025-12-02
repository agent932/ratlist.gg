/**
 * Runtime type guards for validating data shapes at runtime.
 * These guards provide type safety when dealing with external data (API responses, user input, etc.)
 */

import type {
  UserProfile,
  Incident,
  Flag,
  Player,
  Game,
  IncidentCategory,
  ApiError,
  UserRole,
  IncidentStatus,
  IncidentSeverity,
  FlagResolution,
  PlayerTier,
} from './types';

/**
 * Type guard to check if a value is a valid UserRole.
 * 
 * @param value - Value to check
 * @returns True if value is a valid UserRole
 */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && ['user', 'moderator', 'admin'].includes(value);
}

/**
 * Type guard to check if a value is a valid IncidentStatus.
 * 
 * @param value - Value to check
 * @returns True if value is a valid IncidentStatus
 */
export function isIncidentStatus(value: unknown): value is IncidentStatus {
  return typeof value === 'string' && ['active', 'removed', 'pending'].includes(value);
}

/**
 * Type guard to check if a value is a valid IncidentSeverity.
 * 
 * @param value - Value to check
 * @returns True if value is a valid IncidentSeverity
 */
export function isIncidentSeverity(value: unknown): value is IncidentSeverity {
  return typeof value === 'string' && ['low', 'medium', 'high'].includes(value);
}

/**
 * Type guard to check if a value is a valid FlagResolution.
 * 
 * @param value - Value to check
 * @returns True if value is a valid FlagResolution
 */
export function isFlagResolution(value: unknown): value is FlagResolution {
  return typeof value === 'string' && ['open', 'approved', 'dismissed'].includes(value);
}

/**
 * Type guard to check if a value is a valid PlayerTier.
 * 
 * @param value - Value to check
 * @returns True if value is a valid PlayerTier
 */
export function isPlayerTier(value: unknown): value is PlayerTier {
  return typeof value === 'string' && ['S', 'A', 'B', 'C', 'D', 'F'].includes(value);
}

/**
 * Type guard to check if an object has the shape of a UserProfile.
 * 
 * @param value - Value to check
 * @returns True if value matches UserProfile interface
 */
export function isUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.user_id === 'string' &&
    (obj.display_name === null || typeof obj.display_name === 'string') &&
    isUserRole(obj.role) &&
    typeof obj.created_at === 'string' &&
    (obj.suspended_until === null || typeof obj.suspended_until === 'string') &&
    (obj.suspension_reason === null || typeof obj.suspension_reason === 'string')
  );
}

/**
 * Type guard to check if an object has the shape of an Incident.
 * 
 * @param value - Value to check
 * @returns True if value matches Incident interface
 */
export function isIncident(value: unknown): value is Incident {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.id === 'string' &&
    typeof obj.player_id === 'string' &&
    typeof obj.game_id === 'string' &&
    typeof obj.category_name === 'string' &&
    isIncidentSeverity(obj.severity) &&
    typeof obj.description === 'string' &&
    isIncidentStatus(obj.status) &&
    typeof obj.reporter_user_id === 'string' &&
    typeof obj.created_at === 'string'
  );
}

/**
 * Type guard to check if an object has the shape of an ApiError.
 * 
 * @param value - Value to check
 * @returns True if value matches ApiError interface
 */
export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return typeof obj.error === 'string';
}

/**
 * Type guard to check if a fetch response indicates success (status 200-299).
 * 
 * @param response - Fetch Response object
 * @returns True if response status is in 200-299 range
 */
export function isSuccessResponse(response: Response): boolean {
  return response.ok && response.status >= 200 && response.status < 300;
}

/**
 * Safely parse JSON with type validation.
 * 
 * @param json - JSON string to parse
 * @param guard - Type guard function to validate parsed data
 * @returns Parsed and validated data, or null if invalid
 * 
 * @example
 * const user = safeJsonParse(jsonString, isUserProfile);
 * if (user) {
 *   // TypeScript knows user is UserProfile
 *   console.log(user.display_name);
 * }
 */
export function safeJsonParse<T>(
  json: string,
  guard: (value: unknown) => value is T
): T | null {
  try {
    const parsed = JSON.parse(json);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Validate API response data with type guard.
 * 
 * @param data - Data to validate
 * @param guard - Type guard function
 * @throws Error if validation fails
 * @returns Validated data
 * 
 * @example
 * const user = assertType(responseData, isUserProfile);
 * // If we reach here, user is guaranteed to be UserProfile
 */
export function assertType<T>(
  data: unknown,
  guard: (value: unknown) => value is T,
  errorMessage = 'Type assertion failed'
): T {
  if (!guard(data)) {
    throw new Error(errorMessage);
  }
  return data;
}
