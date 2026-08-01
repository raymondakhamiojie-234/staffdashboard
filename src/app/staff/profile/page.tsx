import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: payload.id as number },
    include: { role: true }
  });

  if (!user) redirect('/login');

  return <ProfileClient user={user} />;
}
