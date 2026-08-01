import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId, baseAmount, currency, status, effectiveDate } = await req.json();

    const salary = await prisma.salary.create({
      data: {
        userId: Number(userId),
        baseAmount: Number(baseAmount),
        currency,
        status,
        effectiveDate: new Date(effectiveDate)
      }
    });

    return NextResponse.json({ message: 'Payroll record created', salary });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { salaryId, status } = await req.json();

    const salary = await prisma.salary.update({
      where: { id: Number(salaryId) },
      data: { status }
    });

    return NextResponse.json({ message: 'Payroll status updated', salary });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
