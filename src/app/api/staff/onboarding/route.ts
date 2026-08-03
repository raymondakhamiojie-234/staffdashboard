import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken, signToken } from '@/lib/jwt';
import { logActivity } from '@/lib/activity';

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { type } = body;
    const userId = payload.id as number;

    if (type === 'profile') {
      const { skills, hobbies, education, workBackground } = body;
      await prisma.user.update({
        where: { id: userId },
        data: { skills, hobbies, education, workBackground, profileStatus: 'completed' }
      });
      await logActivity('Completed Profile Onboarding', undefined, userId);
      return NextResponse.json({ message: 'Profile updated' });
    }

    if (type === 'contract') {
      const { signatureData } = body;
      const pendingContract = await prisma.userContract.findFirst({
        where: { userId, status: 'pending' }
      });
      if (pendingContract) {
        await prisma.userContract.update({
          where: { id: pendingContract.id },
          data: { status: 'signed', signedAt: new Date(), signatureHash: signatureData }
        });
      }
      
      await prisma.user.update({
        where: { id: userId },
        data: { contractStatus: 'signed' }
      });
      await logActivity('Signed Employment Contract', undefined, userId);
      return NextResponse.json({ message: 'Contract signed' });
    }

    if (type === 'policy') {
      const latestPolicy = await prisma.policy.findFirst({ orderBy: { createdAt: 'desc' } });
      if (latestPolicy) {
        await prisma.userPolicyAcknowledgement.create({
          data: { userId, policyId: latestPolicy.id }
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { policyStatus: 'acknowledged' }
      });
      
      await logActivity('Acknowledged Company Policy', undefined, userId);

      // Update JWT token with new status
      const newToken = await signToken({
        id: updatedUser.id,
        email: updatedUser.email,
        role: payload.role,
        isAdmin: payload.isAdmin,
        profileStatus: updatedUser.profileStatus,
        contractStatus: updatedUser.contractStatus,
        policyStatus: updatedUser.policyStatus
      });
      
      (await cookies()).set('auth_token', newToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' });

      return NextResponse.json({ message: 'Policy acknowledged' });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
