import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';

export default async function MeetingsPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.isAdmin) redirect('/login');

  const meetings = await prisma.meeting.findMany({
    include: { createdBy: true },
    orderBy: { scheduledAt: 'asc' }
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="page-title">Meeting Scheduler</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Title</th>
              <th style={{ padding: '1rem' }}>Date & Time</th>
              <th style={{ padding: '1rem' }}>Link</th>
              <th style={{ padding: '1rem' }}>Host</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map(meeting => (
              <tr key={meeting.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{meeting.title}</td>
                <td style={{ padding: '1rem' }}>{new Date(meeting.scheduledAt).toLocaleString()}</td>
                <td style={{ padding: '1rem' }}><a href={meeting.link} target="_blank" style={{ color: 'var(--primary)' }}>Join Link</a></td>
                <td style={{ padding: '1rem' }}>{meeting.createdBy.fullName}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge badge-${meeting.status === 'scheduled' ? 'warning' : 'success'}`}>
                    {meeting.status}
                  </span>
                </td>
              </tr>
            ))}
            {meetings.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>No upcoming meetings</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
