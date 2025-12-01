// M004: Auth guards and role checking utilities

import { createSupabaseServer } from '@/lib/supabase/server';

export type UserRole = 'user' | 'moderator' | 'admin';

/**
 * Get the current user's role from their profile
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = createSupabaseServer();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return (profile?.role as UserRole) || null;
}

/**
 * Check if user has required role or higher
 * Role hierarchy: admin > moderator > user
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const supabase = createSupabaseServer();
  
  const { data, error } = await supabase
    .rpc('fn_user_has_role', { target_role: requiredRole });

  if (error) {
    console.error('Error checking user role:', error);
    return false;
  }

  return data === true;
}

/**
 * Require moderator role or higher
 * Throws error if user doesn't have required permissions
 */
export async function requireModerator(): Promise<void> {
  const isModerator = await hasRole('moderator');
  
  if (!isModerator) {
    throw new Error('Moderator access required');
  }
}

/**
 * Require admin role
 * Throws error if user doesn't have admin permissions
 */
export async function requireAdmin(): Promise<void> {
  const isAdmin = await hasRole('admin');
  
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
}

/**
 * Get current user with role information
 */
export async function getCurrentUserWithRole() {
  const supabase = createSupabaseServer();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, display_name')
    .eq('user_id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    role: (profile?.role as UserRole) || 'user',
    displayName: profile?.display_name || null,
  };
}

/**
 * Check if current user is authenticated
 */
export async function requireAuth() {
  const supabase = createSupabaseServer();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}
