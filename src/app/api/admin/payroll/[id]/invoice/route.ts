import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { generateAndUploadInvoice } from '@/lib/pdf';
import { sendNotification } from '@/lib/notifications';
import { logActivity } from '@/lib/activity';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const salaryId = parseInt(params.id);

    const salary = await prisma.salary.findUnique({
      where: { id: salaryId },
      include: { user: { include: { role: true } } }
    });

    if (!salary) return NextResponse.json({ error: 'Salary not found' }, { status: 404 });

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { salaryId: salary.id }
    });

    if (existingInvoice) {
      return NextResponse.json({ error: 'Invoice already generated for this salary' }, { status: 400 });
    }

    // Generate PDF and Upload
    const fileUrl = await generateAndUploadInvoice({
      salaryId: salary.id,
      staffName: salary.user.fullName,
      role: salary.user.role.name,
      amount: salary.amount,
      currency: salary.currency,
      effectiveDate: salary.effectiveDate,
      status: salary.status
    });

    // Save to Database
    const invoice = await prisma.invoice.create({
      data: {
        salaryId: salary.id,
        userId: salary.userId,
        fileUrl: fileUrl,
        status: 'generated'
      }
    });

    await logActivity('Generated Invoice', `For ${salary.user.fullName}`, payload.id as number);

    // Notify user
    await sendNotification({
      userId: salary.userId,
      type: 'salary',
      message: `Your salary invoice for ${new Date(salary.effectiveDate).toLocaleDateString()} has been generated.`,
      channels: ['in-app', 'email', 'whatsapp']
    });

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
