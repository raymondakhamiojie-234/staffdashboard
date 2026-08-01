import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminDashboard() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.isAdmin) redirect('/login');

  // Fetch some stats
  const totalStaff = await prisma.user.count({ where: { role: { isAdmin: false } } });
  const pendingTasks = await prisma.task.count({ where: { status: { in: ['pending', 'in_progress'] } } });
  const activeRoadmaps = await prisma.roadmapTarget.count({ where: { status: 'in_progress' } });
  
  // Recent staff
  const recentStaff = await prisma.user.findMany({
    where: { role: { isAdmin: false } },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { role: true }
  });

  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        <div className="glass-card">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Total Staff</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalStaff}</div>
          <Link href="/admin/staff" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>Manage Staff &rarr;</Link>
        </div>

        <div className="glass-card">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Pending Tasks</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning)' }}>{pendingTasks}</div>
          <Link href="/admin/tasks" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>Manage Tasks &rarr;</Link>
        </div>

        <div className="glass-card">
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Active Roadmaps</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{activeRoadmaps}</div>
          <Link href="/admin/roadmap" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>View Roadmap &rarr;</Link>
        </div>

      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recently Joined Staff</h3>
          <Link href="/admin/staff" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 500 }}>View All</Link>
        </div>
        
        {recentStaff.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No staff members found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentStaff.map(staff => (
              <div key={staff.id} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'
              }}>
                <div>
                  <h4 style={{ fontWeight: 600 }}>{staff.fullName}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{staff.email}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{staff.role.name}</div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: staff.profileStatus === 'completed' ? 'var(--secondary)' : 'var(--warning)' 
                  }}>
                    {staff.profileStatus === 'completed' ? 'Onboarded' : 'Pending Onboarding'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
