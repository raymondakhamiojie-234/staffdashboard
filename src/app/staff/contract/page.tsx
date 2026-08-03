import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import StaffContractClient from './StaffContractClient';

export default async function StaffContractPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || payload.isAdmin) redirect('/login');

  const contract = await prisma.userContract.findFirst({
    where: { userId: Number(payload.id), status: 'signed' },
    include: { contractTemplate: true }
  });

  return (
    <div>
      <h1 className="page-title">My Contract</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Review your signed employment agreement.</p>
      
      {!contract ? (
        <div className="glass-card">
          <p style={{ color: 'var(--warning)' }}>No signed contract found on file.</p>
        </div>
      ) : (
        <StaffContractClient contract={contract} user={payload as any} />
      )}
    </div>
  );
}
