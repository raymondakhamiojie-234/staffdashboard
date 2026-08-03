import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import ContractsAdminClient from './ContractsAdminClient';

export default async function AdminContractsPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.isAdmin) redirect('/login');

  const contracts = await prisma.userContract.findMany({
    include: { 
      contractTemplate: true,
      user: { select: { fullName: true, email: true, role: { select: { name: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return <ContractsAdminClient initialContracts={contracts} />;
}
