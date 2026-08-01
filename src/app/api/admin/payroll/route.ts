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

    const { userId, amount, currency, status, effectiveDate } = await req.json();

    const salary = await prisma.salary.create({
      data: {
        userId: Number(userId),
        amount: Number(amount),
        currency,
        status,
        effectiveDate: new Date(effectiveDate)
      }
    });

    await prisma.notification.create({
      data: {
        userId: Number(userId),
        type: 'salary',
        message: `A new payroll record for ${currency} ${amount} has been added.`
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

    if (status === 'paid') {
      await prisma.notification.create({
        data: {
          userId: salary.userId,
          type: 'salary',
          message: `Your payroll of ${salary.currency} ${salary.amount} has been marked as PAID.`
        }
      });
    }

    return NextResponse.json({ message: 'Payroll status updated', salary });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
