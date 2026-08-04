import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import RecycleBinClient from './RecycleBinClient';

export default async function RecycleBinPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.isAdmin) redirect('/login');

  const deletedUsers = await prisma.user.findMany({
    where: { isDeleted: true },
    include: { role: true },
    orderBy: { deletedAt: 'desc' }
  });

  return <RecycleBinClient initialUsers={deletedUsers} />;
}
