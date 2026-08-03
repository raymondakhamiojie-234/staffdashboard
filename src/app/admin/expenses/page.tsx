import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';

export default async function ExpensesPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.isAdmin) redirect('/login');

  const expenses = await prisma.expense.findMany({
    include: { recordedBy: true, user: true },
    orderBy: { recordedAt: 'desc' }
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="page-title">Expense Management</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Title</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Recorded By</th>
              <th style={{ padding: '1rem' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{expense.title}</td>
                <td style={{ padding: '1rem' }}>${expense.amount.toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge badge-${expense.category === 'company' ? 'primary' : 'secondary'}`}>
                    {expense.category}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{expense.recordedBy.fullName}</td>
                <td style={{ padding: '1rem' }}>{new Date(expense.recordedAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>No expenses recorded</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
