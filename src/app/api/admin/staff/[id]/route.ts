import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { logActivity } from '@/lib/activity';

// DELETE to soft delete a user
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const userId = Number(resolvedParams.id);
    if (isNaN(userId)) return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.role.isAdmin) return NextResponse.json({ error: 'Cannot delete an admin' }, { status: 400 });

    await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    await logActivity('Deleted Staff Member', JSON.stringify({ userId, name: user.fullName }), payload.id as number);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH to restore a user
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const userId = Number(resolvedParams.id);
    if (isNaN(userId)) return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: false, deletedAt: null }
    });

    await logActivity('Restored Staff Member', JSON.stringify({ userId, name: user.fullName }), payload.id as number);

    return NextResponse.json({ message: 'User restored successfully' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
