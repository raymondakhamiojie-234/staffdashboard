import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: payload.id as number }
  });

  if (!user) redirect('/login');

  // If already fully onboarded, kick them out to dashboard
  if (user.profileStatus === 'completed' && user.contractStatus === 'signed' && user.policyStatus === 'acknowledged') {
    redirect('/staff/dashboard');
  }

  // Fetch pending contract
  const contract = await prisma.userContract.findFirst({
    where: { userId: user.id, status: 'pending' },
    include: { contractTemplate: true }
  });

  // Fetch latest policy
  const policy = await prisma.policy.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  return <OnboardingClient user={user} policy={policy} contract={contract} />;
}
