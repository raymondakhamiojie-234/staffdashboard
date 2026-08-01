import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import ChatClient from '@/components/ChatClient';

export default async function AdminChatPage() {
  const token = cookies().get('auth_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.isAdmin) redirect('/login');

  return (
    <div>
      <h1 className="page-title">Internal Communications</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Direct messaging with all staff and administrators.</p>
      <ChatClient currentUserId={payload.userId} />
    </div>
  );
}
