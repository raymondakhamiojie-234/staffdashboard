import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import ProjectDetailsClient from './ProjectDetailsClient';

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.isAdmin) redirect('/login');

  const resolvedParams = await params;
  const projectId = parseInt(resolvedParams.id);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      leader: { select: { fullName: true } },
      members: { include: { user: { select: { id: true, fullName: true, email: true } } } },
      tasks: {
        include: {
          assignedTo: { select: { id: true, fullName: true } },
          assignedBy: { select: { fullName: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!project) redirect('/admin/projects');

  const staff = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, fullName: true, email: true }
  });

  return <ProjectDetailsClient project={project} staff={staff} />;
}
