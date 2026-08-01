import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import RoadmapClient from './RoadmapClient';

export default async function AdminRoadmapPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.isAdmin) redirect('/login');

  const roadmapItems = await prisma.roadmapTarget.findMany({
    orderBy: { year: 'asc' }
  });

  return <RoadmapClient initialItems={roadmapItems} />;
}
