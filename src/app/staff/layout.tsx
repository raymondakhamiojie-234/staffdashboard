import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { redirect } from 'next/navigation';

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyToken(token);

  if (!payload) {
    redirect('/login');
  }

  const isFullyOnboarded = 
    payload.profileStatus === 'completed' && 
    payload.contractStatus === 'signed' && 
    payload.policyStatus === 'acknowledged';

  return (
    <div className="dashboard-layout">
      {/* If fully onboarded, show sidebar, otherwise they shouldn't navigate away from onboarding */}
      {isFullyOnboarded && <Sidebar role="staff" />}
      
      <div className="main-content">
        <Header 
          userName={payload.email as string} 
          role={payload.role as string} 
        />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}
