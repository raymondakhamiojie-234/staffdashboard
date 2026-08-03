import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { logActivity } from '@/lib/activity';

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date } = await req.json(); // YYYY-MM-DD
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Find all active staff members
    const activeStaff = await prisma.user.findMany({
      where: { isActive: true, role: { isAdmin: false } },
      include: {
        salaries: {
          orderBy: { effectiveDate: 'desc' },
          take: 1
        }
      }
    });

    // Find attendances for this date
    const attendances = await prisma.attendance.findMany({
      where: { date }
    });
    const presentUserIds = new Set(attendances.map(a => a.userId));

    const yyyyMm = date.substring(0, 7); // e.g., 2026-08
    let penaltyCount = 0;

    for (const staff of activeStaff) {
      if (!presentUserIds.has(staff.id)) {
        // Staff was absent
        const activeSalary = staff.salaries[0];
        if (activeSalary && activeSalary.amount > 0) {
          const reasonStr = `Missed Attendance on ${date}`;

          // Check if penalty already applied
          const existingPenalty = await prisma.salaryDeduction.findFirst({
            where: {
              userId: staff.id,
              reason: reasonStr
            }
          });

          if (!existingPenalty) {
            // Deduct 2 days of salary
            const dailyRate = activeSalary.amount / 30;
            const penaltyAmount = dailyRate * 2;

            await prisma.salaryDeduction.create({
              data: {
                userId: staff.id,
                amount: penaltyAmount,
                reason: reasonStr,
                date: yyyyMm
              }
            });
            penaltyCount++;

            // Notify staff
            await prisma.notification.create({
              data: {
                userId: staff.id,
                type: 'salary',
                message: `You missed attendance on ${date}. A penalty of 2 days' salary ($${penaltyAmount.toFixed(2)}) has been applied to this month's payroll.`
              }
            });
          }
        }
      }
    }

    await logActivity('Evaluated Attendance', `Applied ${penaltyCount} penalties for ${date}`, Number(payload.id));

    return NextResponse.json({ message: `Evaluated successfully. Applied ${penaltyCount} penalties.` });
  } catch (error: any) {
    console.error('Evaluate attendance error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
