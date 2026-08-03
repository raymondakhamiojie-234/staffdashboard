import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import SalaryClient from './SalaryClient';

export default async function StaffSalaryPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || payload.isAdmin) redirect('/login');

  const salaries = await prisma.salary.findMany({
    where: { userId: Number(payload.id) },
    include: { invoice: true },
    orderBy: { effectiveDate: 'desc' }
  });

  return <SalaryClient salaries={salaries} />;
}
