import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import ReportsClient from './ReportsClient';

export default async function StaffReportsPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || payload.isAdmin) redirect('/login');

  const tasks = await prisma.task.findMany({
    where: { assignedToId: Number(payload.id), status: { not: 'archived' } },
    select: { id: true, title: true, status: true }
  });

  const myReports = await prisma.report.findMany({
    where: { submittedById: Number(payload.id) },
    orderBy: { submittedAt: 'desc' },
    include: { task: { select: { title: true } } },
    take: 20
  });

  return <ReportsClient tasks={tasks} myReports={myReports} />;
}
