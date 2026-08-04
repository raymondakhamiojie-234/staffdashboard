import prisma from '@/lib/prisma';
import PolicyAdminClient from './PolicyAdminClient';

export default async function AdminPolicyPage() {
  const latestPolicy = await prisma.policy.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  const acks = await prisma.userPolicyAcknowledgement.findMany({
    include: {
      user: { select: { fullName: true, email: true, role: { select: { name: true } } } },
      policy: { select: { title: true } }
    },
    orderBy: { acknowledgedAt: 'desc' },
    take: 50
  });

  return <PolicyAdminClient latestPolicy={latestPolicy} recentAcks={acks} />;
}
