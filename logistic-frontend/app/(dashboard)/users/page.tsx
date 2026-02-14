import { usersApi, type User } from '@/lib/api-server';
import { UsersPageClient } from './users-page-client';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  let users: User[] = [];
  try {
    const result = await usersApi.getAll();
    users = Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error fetching users:', error);
  }

  return (
    <UsersPageClient initialUsers={users} />
  );
}
