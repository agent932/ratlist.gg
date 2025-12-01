// M019: User management page
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guards';
import { createSupabaseServer } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import type { UserProfile } from '@/lib/types';

interface UserSearchResult extends UserProfile {
  email?: string;
  incident_count: number;
  flag_count: number;
}

export const metadata = {
  title: 'User Management | Admin',
  description: 'Search and manage users',
};

async function searchUsers(query?: string, role?: string) {
  const supabase = createSupabaseServer();
  
  const { data, error } = await supabase.rpc('fn_search_users', {
    query: query || '',
    role_filter: role || 'all',
    lim: 50,
  });

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return data || [];
}

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string };
}) {
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/');
  }

  const users = await searchUsers(searchParams.q, searchParams.role);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-white/60">Search and manage user accounts</p>
      </div>

      {/* Search Form */}
      <Card className="p-6 border-white/10 bg-white/5 mb-6">
        <form method="get" className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              name="q"
              placeholder="Search by display name or email..."
              defaultValue={searchParams.q}
              className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <select
            name="role"
            defaultValue={searchParams.role || ''}
            className="px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg font-semibold transition-colors"
          >
            Search
          </button>
        </form>
      </Card>

      {/* Results */}
      {users.length === 0 ? (
        <Card className="p-8 text-center border-white/10 bg-white/5">
          <p className="text-white/60">
            {searchParams.q || searchParams.role
              ? 'No users found matching your search'
              : 'Enter a search query to find users'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user: UserSearchResult) => (
            <Card key={user.user_id} className="p-4 border-white/10 bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {user.display_name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          : user.role === 'moderator'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      }`}
                    >
                      {user.role}
                    </span>
                    {user.suspended_until && new Date(user.suspended_until) > new Date() && (
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400 border-red-500/30">
                        Suspended
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>Email: {user.email || 'N/A'}</span>
                    <span>•</span>
                    <span>Incidents: {user.incident_count}</span>
                    <span>•</span>
                    <span>Flags: {user.flag_count}</span>
                  </div>

                  <div className="text-xs text-white/40 mt-1">
                    Joined: {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>

                  {user.suspended_until && new Date(user.suspended_until) > new Date() && user.suspension_reason && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                      <strong>Suspension reason:</strong> {user.suspension_reason}
                      <br />
                      <strong>Until:</strong> {new Date(user.suspended_until).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/user/${user.display_name}`}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-sm transition-colors"
                  >
                    View Profile
                  </Link>
                  {/* Future: Add suspend/role management buttons */}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
