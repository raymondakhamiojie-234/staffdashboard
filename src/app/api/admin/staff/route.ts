import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' }
    });

    const roles = await prisma.role.findMany();

    return NextResponse.json({ users, roles });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId, roleId, isActive, salaryAmount } = await req.json();

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const dataToUpdate: any = {};
    if (roleId !== undefined) dataToUpdate.roleId = roleId;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;

    await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate
    });

    if (salaryAmount !== undefined && salaryAmount !== '') {
      const latestSalary = await prisma.salary.findFirst({
        where: { userId },
        orderBy: { effectiveDate: 'desc' }
      });
      
      if (!latestSalary || latestSalary.amount !== Number(salaryAmount)) {
        await prisma.salary.create({
          data: {
            userId,
            amount: Number(salaryAmount),
            effectiveDate: new Date(),
            status: 'pending'
          }
        });
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, salaries: { orderBy: { effectiveDate: 'desc' }, take: 1 } }
    });

    return NextResponse.json({ message: 'User updated', user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
