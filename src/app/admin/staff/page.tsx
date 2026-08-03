import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import StaffClient from './StaffClient';

export default async function AdminStaffPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.isAdmin) redirect('/login');

  const users = await prisma.user.findMany({
    include: { 
      role: true,
      salaries: { orderBy: { effectiveDate: 'desc' }, take: 1 } 
    },
    orderBy: { createdAt: 'desc' }
  });

  const roles = await prisma.role.findMany();

  return <StaffClient initialUsers={users} roles={roles} />;
}
