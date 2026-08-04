import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { logActivity } from '@/lib/activity';

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { userId, templateId } = body;

    if (!userId || !templateId) {
      return NextResponse.json({ error: 'Missing userId or templateId' }, { status: 400 });
    }

    // Check if user already has an active or pending contract
    const existingContract = await prisma.userContract.findFirst({
      where: { userId: Number(userId), status: { in: ['pending', 'signed'] } }
    });

    if (existingContract) {
      return NextResponse.json({ error: 'User already has a contract' }, { status: 400 });
    }

    const newContract = await prisma.userContract.create({
      data: {
        userId: Number(userId),
        contractTemplateId: Number(templateId),
        status: 'pending'
      }
    });

    // Update user status
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { contractStatus: 'pending' }
    });

    // Send a notification to the user
    await prisma.notification.create({
      data: {
        userId: Number(userId),
        type: 'contract',
        message: 'A new employment contract has been assigned to you. Please review and sign it.'
      }
    });

    await logActivity('Assigned Contract', JSON.stringify({ userId, templateId }), payload.id as number);

    return NextResponse.json({ message: 'Contract assigned successfully', contract: newContract });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
