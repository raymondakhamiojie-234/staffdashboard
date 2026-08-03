import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import ProjectsAdminClient from './ProjectsAdminClient';

export default async function AdminProjectsPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.isAdmin) redirect('/login');

  const projects = await prisma.project.findMany({
    include: {
      leader: { select: { fullName: true } },
      members: { include: { user: { select: { fullName: true } } } },
      tasks: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const staff = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, fullName: true, email: true }
  });

  return <ProjectsAdminClient initialProjects={projects} staff={staff} />;
}
