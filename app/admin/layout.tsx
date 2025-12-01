import { AdminNav } from '@/components/features/navigation/AdminNav';
import { getCurrentUserRole } from '@/lib/auth/guards';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getCurrentUserRole();
  const isAdmin = role === 'admin';

  return (
    <>
      <AdminNav isAdmin={isAdmin} />
      {children}
    </>
  );
}
