import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { supabaseAdmin } from '@/lib/supabase';
import { logActivity } from '@/lib/activity';

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const taskId = formData.get('taskId') as string;

    if (!file || !taskId) {
      return NextResponse.json({ error: 'File and Task ID are required' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `task_files/${taskId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json({ error: 'Failed to upload to Supabase Storage' }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('uploads').getPublicUrl(filePath);
    const fileUrl = publicUrlData.publicUrl;

    const taskFile = await prisma.taskFile.create({
      data: {
        taskId: Number(taskId),
        uploadedById: Number(payload.id),
        fileName: file.name,
        fileUrl: fileUrl,
        fileSize: file.size,
        fileType: file.type
      }
    });

    await logActivity('Uploaded Task File', `Uploaded ${file.name} to task ID ${taskId}`, Number(payload.id));

    return NextResponse.json({ message: 'File uploaded successfully', taskFile });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
