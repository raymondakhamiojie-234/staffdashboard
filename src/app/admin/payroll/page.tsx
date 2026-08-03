import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import PayrollClient from './PayrollClient';

export default async function AdminPayrollPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.isAdmin) redirect('/login');

  const staff = await prisma.user.findMany({
    where: { role: { isAdmin: false } },
    include: {
      salaries: { 
        orderBy: { effectiveDate: 'desc' },
        include: { statusHistory: { include: { updatedBy: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' } } }
      }
    },
    orderBy: { fullName: 'asc' }
  });

  return <PayrollClient staff={staff} />;
}
