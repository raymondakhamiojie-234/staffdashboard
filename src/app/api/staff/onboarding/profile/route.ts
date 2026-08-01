import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken, signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { skills, hobbies, education, workBackground } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: payload.id as number },
      data: {
        skills,
        hobbies,
        education,
        workBackground,
        profileStatus: 'completed'
      },
      include: { role: true }
    });

    // Re-issue JWT with updated profileStatus
    const newPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role.name,
      isAdmin: updatedUser.role.isAdmin,
      isActive: updatedUser.isActive,
      profileStatus: updatedUser.profileStatus,
      contractStatus: updatedUser.contractStatus,
      policyStatus: updatedUser.policyStatus
    };

    const newToken = await signToken(newPayload);

    (await cookies()).set({
      name: 'auth_token',
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ message: 'Profile updated' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
