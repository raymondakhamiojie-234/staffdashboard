import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description, assignedToId, dueDate } = await req.json();

    if (!title || !assignedToId) {
      return NextResponse.json({ error: 'Title and Assignee are required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assignedById: Number(payload.userId),
        assignedToId: Number(assignedToId),
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    await prisma.notification.create({
      data: {
        userId: Number(assignedToId),
        type: 'task',
        message: `You have been assigned a new task: ${title}`
      }
    });

    return NextResponse.json({ message: 'Task assigned successfully', task });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { taskId, status } = await req.json();

    if (!taskId || !status) {
      return NextResponse.json({ error: 'Task ID and Status are required' }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: { id: Number(taskId) },
      data: { status }
    });

    return NextResponse.json({ message: 'Task updated', task });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
