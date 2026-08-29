import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email: rawEmail, password } = await req.json();
    const email = rawEmail ? rawEmail.trim() : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and Password are required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials: User not found.' },
        { status: 401 }
      );
    }

    if (user.isDeleted) {
      return NextResponse.json(
        { error: 'Invalid credentials: Account has been deleted.' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials: Password incorrect.' },
        { status: 401 }
      );
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      isAdmin: user.role.isAdmin,
      isActive: user.isActive,
      profileStatus: user.profileStatus,
      contractStatus: user.contractStatus,
      policyStatus: user.policyStatus
    };

    const token = await signToken(payload);

    // Set cookie
    (await cookies()).set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
        isAdmin: user.role.isAdmin,
        isActive: user.isActive
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
