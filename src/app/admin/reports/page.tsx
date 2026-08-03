import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import AdminReportsClient from './AdminReportsClient';

export default async function AdminReportsPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.isAdmin) redirect('/login');

  const reports = await prisma.report.findMany({
    include: { 
      submittedBy: { select: { fullName: true, profileImageUrl: true } },
      task: { select: { title: true } } 
    },
    orderBy: { submittedAt: 'desc' },
    take: 100 // Limit to recent 100 for performance
  });

  return <AdminReportsClient initialReports={reports} />;
}
