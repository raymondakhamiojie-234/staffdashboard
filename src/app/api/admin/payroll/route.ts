import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { logActivity } from '@/lib/activity';

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
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

    await prisma.payrollStatusHistory.create({
      data: {
        salaryId: salary.id,
        status: status,
        updatedById: Number(payload.id),
        note: 'Initial payroll creation'
      }
    });

    await prisma.notification.create({
      data: {
        userId: Number(userId),
        type: 'salary',
        message: `A new payroll record for ${currency} ${amount} has been added.`
      }
    });

    await logActivity('Created Payroll', `Created payroll for user ID ${userId}`, Number(payload.id));

    return NextResponse.json({ message: 'Payroll record created', salary });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { salaryId, status, adminNote } = await req.json();

    const salary = await prisma.salary.update({
      where: { id: Number(salaryId) },
      data: { 
        status,
        adminNote: adminNote || null
      }
    });

    await prisma.payrollStatusHistory.create({
      data: {
        salaryId: salary.id,
        status: status,
        updatedById: Number(payload.id),
        note: adminNote || null
      }
    });

    let message = '';
    if (status === 'paid') {
      message = `Your payroll of ${salary.currency} ${salary.amount} has been marked as PAID.`;
    } else if (status === 'suspended') {
      message = `Your payroll has been SUSPENDED. Reason: ${adminNote || 'No reason provided'}`;
    } else {
      message = `Your payroll status is now: ${status.replace('_', ' ').toUpperCase()}`;
    }

    await prisma.notification.create({
      data: {
        userId: salary.userId,
        type: 'salary',
        message
      }
    });

    await logActivity('Updated Payroll Status', `Updated salary ID ${salaryId} to ${status}`, Number(payload.id));

    return NextResponse.json({ message: 'Payroll status updated', salary });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

