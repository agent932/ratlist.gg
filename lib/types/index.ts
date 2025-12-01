/**
 * Shared TypeScript type definitions for the application
 */

// Database enums
export type UserRole = 'user' | 'moderator' | 'admin';
export type IncidentStatus = 'active' | 'removed' | 'pending';
export type IncidentSeverity = 'low' | 'medium' | 'high';
export type FlagResolution = 'open' | 'approved' | 'dismissed';
export type FlagStatus = 'open' | 'closed';
export type PlayerTier = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

// User types
export interface UserProfile {
  user_id: string;
  email?: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
  suspended_until: string | null;
  suspension_reason: string | null;
}

// Incident types
export interface Incident {
  id: string;
  player_id: string;
  game_id: string;
  game_name?: string;
  game_slug?: string;
  category_name: string;
  severity: IncidentSeverity;
  description: string;
  status: IncidentStatus;
  reporter_user_id: string;
  flagged?: boolean;
  created_at: string;
  moderated_at?: string | null;
  moderation_reason?: string | null;
  moderator_name?: string | null;
  moderator_id?: string | null;
}

// Flag types
export interface Flag {
  id: string;
  incident_id: string;
  player_id: string;
  game_name: string;
  game_slug: string;
  incident_category: string;
  incident_description: string;
  flag_reason: string;
  resolution: FlagResolution;
  flag_status: FlagStatus;
  created_at: string;
  reviewed_at?: string | null;
  reviewer_name?: string | null;
  moderator_notes?: string | null;
  flagger_user_id: string;
  flagger_name?: string;
}

// Player types
export interface Player {
  id: string;
  game_id: string;
  identifier: string;
  display_name: string | null;
  reputation_score: number;
  tier: PlayerTier;
  incident_count: number;
  created_at: string;
}

export interface LinkedPlayer {
  id: string;
  user_id: string;
  player_id: string;
  game_id: string;
  game_name: string;
  game_slug: string;
  verified: boolean;
  linked_at: string;
  tier?: PlayerTier;
  incident_count?: number;
}

// Game types
export interface Game {
  id: string;
  slug: string;
  name: string;
  description?: string;
  created_at: string;
}

// Moderation log types
export interface ModerationLog {
  id: string;
  moderator_id: string;
  moderator_name?: string;
  action: string;
  target_type?: string;
  target_id?: string;
  target_user_id?: string;
  reason?: string;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Category types
export interface IncidentCategory {
  id: number;
  slug: string;
  label: string;
  description?: string;
}

// API Response types
export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
