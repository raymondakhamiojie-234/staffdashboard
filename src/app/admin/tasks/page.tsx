import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import TasksAdminClient from './TasksAdminClient';

export default async function AdminTasksPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.isAdmin) redirect('/login');

  const tasks = await prisma.task.findMany({
    include: {
      assignedTo: { select: { fullName: true, id: true } },
      assignedBy: { select: { fullName: true } },
      reports: { 
        orderBy: { submittedAt: 'desc' },
        include: { replies: { include: { sender: { select: { fullName: true } } }, orderBy: { createdAt: 'asc' } } }
      },
      taskFiles: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const staff = await prisma.user.findMany({
    where: { role: { isAdmin: false }, isActive: true, profileStatus: 'completed' },
    select: { id: true, fullName: true, role: { select: { name: true } } }
  });

  return <TasksAdminClient initialTasks={tasks} staff={staff} />;
}
