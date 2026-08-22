import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const type = formData.get('type') as string;
    const content = formData.get('content') as string;
    const taskIdStr = formData.get('taskId') as string;
    const file = formData.get('file') as File | null;

    if (!type || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const taskId = taskIdStr && taskIdStr !== 'null' ? Number(taskIdStr) : null;

    if (taskId) {
      // Verify task belongs to user
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task || task.assignedToId !== payload.id) {
        return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 403 });
      }
      
      if (task.status === 'pending') {
        await prisma.task.update({
          where: { id: taskId },
          data: { status: 'in_progress' }
        });
      }
    }

    let fileUrl = null;
    let fileName = null;

    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 });
      }
      
      const fileBuffer = await file.arrayBuffer();
      const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const filePath = `task_files/reports_${payload.id}/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error(uploadError);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
      fileUrl = publicUrlData.publicUrl;
      fileName = file.name;
    }

    const report = await prisma.report.create({
      data: {
        taskId,
        submittedById: payload.id as number,
        type,
        content,
        fileUrl,
        fileName
      }
    });

    return NextResponse.json({ message: 'Report submitted successfully', report });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
