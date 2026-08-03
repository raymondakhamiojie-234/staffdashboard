import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { logActivity } from '@/lib/activity';

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description, leaderId, deadline, memberIds } = await req.json();

    if (!title || !leaderId) {
      return NextResponse.json({ error: 'Title and Leader ID are required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        leaderId: Number(leaderId),
        deadline: deadline ? new Date(deadline) : null,
      }
    });

    // Add leader as a member
    const membersData = [{ projectId: project.id, userId: Number(leaderId), role: 'leader' }];
    
    // Add other members
    if (memberIds && Array.isArray(memberIds)) {
      for (const mId of memberIds) {
        if (mId !== Number(leaderId)) {
          membersData.push({ projectId: project.id, userId: Number(mId), role: 'member' });
        }
      }
    }

    await prisma.projectMember.createMany({ data: membersData });

    // Notify members
    const userIds = membersData.map(m => m.userId);
    const notifications = userIds.map(uid => ({
      userId: uid,
      type: 'project',
      message: `You have been added to the new project: ${title}`
    }));

    await prisma.notification.createMany({ data: notifications });

    await logActivity('Created Project', `Created project ID ${project.id}: ${title}`, Number(payload.id));

    return NextResponse.json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Admin sees all, Staff sees their projects
    const whereClause = payload.isAdmin ? {} : {
      members: { some: { userId: Number(payload.id) } }
    };

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        leader: { select: { fullName: true } },
        members: { include: { user: { select: { fullName: true, profileImageUrl: true } } } },
        tasks: { select: { id: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate progress based on tasks for each project
    const enhancedProjects = projects.map(p => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter(t => t.status === 'completed').length;
      const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
      return { ...p, calculatedProgress: progress };
    });

    return NextResponse.json(enhancedProjects);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
