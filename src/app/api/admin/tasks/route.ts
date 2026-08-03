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

    const { title, description, assignedToId, dueDate, priority, parentId, projectId } = await req.json();

    if (!title || !assignedToId) {
      return NextResponse.json({ error: 'Title and Assignee are required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assignedById: Number(payload.id),
        assignedToId: Number(assignedToId),
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'primary',
        parentId: parentId ? Number(parentId) : null,
        projectId: projectId ? Number(projectId) : null
      }
    });

    await prisma.notification.create({
      data: {
        userId: Number(assignedToId),
        type: 'task',
        message: `You have been assigned a new ${priority || 'primary'} task: ${title}`
      }
    });

    await logActivity('Created Task', `Created task ID ${task.id}: ${task.title}`, Number(payload.id));

    return NextResponse.json({ message: 'Task assigned successfully', task });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { taskId, status, isDeleted, priority } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (isDeleted !== undefined) updateData.isDeleted = isDeleted;
    if (priority) updateData.priority = priority;

    const task = await prisma.task.update({
      where: { id: Number(taskId) },
      data: updateData
    });

    if (isDeleted) {
      await logActivity('Archived Task', `Archived task ID ${task.id}`, Number(payload.id));
      await prisma.notification.create({
        data: {
          userId: task.assignedToId,
          type: 'task',
          message: `Your task "${task.title}" has been deleted/archived by admin.`
        }
      });
    } else {
      await logActivity('Updated Task', `Updated task ID ${task.id}`, Number(payload.id));
    }

    return NextResponse.json({ message: 'Task updated', task });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const taskId = url.searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Soft delete
    const task = await prisma.task.update({
      where: { id: Number(taskId) },
      data: { isDeleted: true, status: 'archived' }
    });

    await logActivity('Deleted Task', `Soft-deleted task ID ${task.id}`, Number(payload.id));

    await prisma.notification.create({
      data: {
        userId: task.assignedToId,
        type: 'task',
        message: `Your task "${task.title}" has been deleted by admin.`
      }
    });

    return NextResponse.json({ message: 'Task deleted (archived)', task });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

