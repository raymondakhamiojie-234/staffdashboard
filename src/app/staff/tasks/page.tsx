import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import TasksClient from './TasksClient';

export default async function TasksPage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.id) redirect('/login');

  const tasks = await prisma.task.findMany({
    where: { assignedToId: payload.id as number },
    include: {
      assignedBy: { select: { fullName: true } },
      reports: { orderBy: { submittedAt: 'desc' } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return <TasksClient tasks={tasks} />;
}
