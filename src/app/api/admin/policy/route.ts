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
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Since there's only one main company policy, we can just replace or update it.
    // Let's create a new one to keep history or just find the first and update it.
    // The onboarding looks for the latest policy (usually findFirst orderBy desc).
    const policy = await prisma.policy.create({
      data: {
        title,
        content
      }
    });

    // Notify all active users that a new policy was published
    const users = await prisma.user.findMany({ where: { isActive: true, role: { isAdmin: false } } });
    const notifications = users.map(user => ({
      userId: user.id,
      type: 'policy',
      message: `A new Company Policy "${title}" has been published. Please review and acknowledge it in your dashboard.`
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
      
      // Update policyStatus of all users to pending so they have to acknowledge it again
      await prisma.user.updateMany({
        where: { isActive: true, role: { isAdmin: false } },
        data: { policyStatus: 'pending' }
      });
    }

    await logActivity('Published New Policy', JSON.stringify({ title, policyId: policy.id }), payload.id as number);

    return NextResponse.json({ message: 'Policy published', policy });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
