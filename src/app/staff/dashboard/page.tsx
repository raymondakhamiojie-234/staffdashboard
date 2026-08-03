import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import AttendanceButton from './AttendanceButton';

export default async function StaffDashboard() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: payload.id as number },
    include: {
      tasksReceived: {
        take: 5,
        orderBy: { dueDate: 'asc' }
      },
      salaries: {
        take: 1,
        orderBy: { effectiveDate: 'desc' }
      }
    }
  });

  if (!user) redirect('/login');

  const pendingTasks = user.tasksReceived.filter((t: any) => t.status === 'pending' || t.status === 'in_progress');
  const latestSalary = user.salaries[0];

  const today = new Date().toISOString().split('T')[0];
  const hasMarkedToday = await prisma.attendance.findUnique({
    where: { userId_date: { userId: user.id, date: today } }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Welcome back, {user.fullName.split(' ')[0]}</h1>
        <AttendanceButton hasMarkedToday={!!hasMarkedToday} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Quick Stats Widget */}
        <div className="glass-card">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Current Status
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.125rem' }}>Pending Tasks</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>{pendingTasks.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.125rem' }}>Salary Status</span>
            <span style={{ 
              fontSize: '1.125rem', 
              fontWeight: 'bold', 
              color: latestSalary?.status === 'paid' ? 'var(--secondary)' : 'var(--warning)' 
            }}>
              {latestSalary?.status ? latestSalary.status.toUpperCase() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Tasks Widget */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Tasks</h3>
            <a href="/staff/tasks" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 500 }}>View All</a>
          </div>
          
          {user.tasksReceived.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>You have no assigned tasks right now.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {user.tasksReceived.map((task: any) => (
                <div key={task.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                  borderLeft: `4px solid ${task.status === 'completed' ? 'var(--secondary)' : 'var(--warning)'}`
                }}>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{task.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</p>
                  </div>
                  <span style={{ 
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                    background: task.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: task.status === 'completed' ? 'var(--secondary)' : 'var(--warning)'
                  }}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
