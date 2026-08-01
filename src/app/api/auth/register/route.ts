import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { fullName, email, password, phone, address, roleName } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Full Name, Email, and Password are required.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already in use.' },
        { status: 400 }
      );
    }

    // Default to 'Staff' role if none provided
    const targetRoleName = roleName || 'Staff';
    
    // Find or create the role
    let role = await prisma.role.findUnique({
      where: { name: targetRoleName },
    });

    if (!role) {
      // For initial setup, allow creating roles on the fly if they don't exist.
      // Usually, we'd seed these roles.
      role = await prisma.role.create({
        data: {
          name: targetRoleName,
          isAdmin: ['Founder', 'CEO', 'CTO', 'COO', 'Admin'].includes(targetRoleName),
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        phone,
        address,
        roleId: role.id,
        // New users need to complete their profile/contract/policies
        profileStatus: 'pending',
        contractStatus: 'pending',
        policyStatus: 'pending',
      },
    });

    return NextResponse.json({
      message: 'Account created successfully',
      userId: newUser.id,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
