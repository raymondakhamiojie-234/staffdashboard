'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  Bell, 
  TrendingUp,
  Settings,
  Briefcase,
  Activity,
  CalendarCheck
} from 'lucide-react';

export default function Sidebar({ role }: { role: 'admin' | 'staff' }) {
  const pathname = usePathname();

  const adminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/admin/projects', icon: Briefcase },
    { name: 'Staff Management', href: '/admin/staff', icon: Users },
    { name: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
    { name: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
    { name: 'Contracts', href: '/admin/contracts', icon: FileText },
    { name: 'Payroll & Salaries', href: '/admin/payroll', icon: CreditCard },
    { name: 'Communications', href: '/admin/chat', icon: MessageSquare },
    { name: 'Activity Reports', href: '/admin/reports', icon: Activity },
    { name: 'Updates', href: '/admin/updates', icon: Bell },
    { name: 'Roadmap', href: '/admin/roadmap', icon: TrendingUp },
  ];

  const staffLinks = [
    { name: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
    { name: 'Tasks & Reports', href: '/staff/tasks', icon: CheckSquare },
    { name: 'My Contract', href: '/staff/contract', icon: FileText },
    { name: 'Profile & CV', href: '/staff/profile', icon: Briefcase },
    { name: 'Submit Reports', href: '/staff/reports', icon: Activity },
    { name: 'Salary', href: '/staff/salary', icon: CreditCard },
    { name: 'Communications', href: '/staff/chat', icon: MessageSquare },
  ];

  const links = role === 'admin' ? adminLinks : staffLinks;

  return (
    <>
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          width: '40px', height: '40px', borderRadius: '8px', 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: '12px', fontWeight: 'bold', fontSize: '1.2rem', color: 'white'
        }}>
          F
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Falcus Media</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link 
              key={link.name} 
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                color: isActive ? 'white' : 'var(--text-muted)',
                background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                transition: 'all 0.2s',
                fontWeight: isActive ? '600' : '500'
              }}
            >
              <Icon size={20} style={{ marginRight: '12px', color: isActive ? 'var(--primary)' : 'inherit' }} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
        <Link 
          href="/settings"
          style={{
            display: 'flex', alignItems: 'center', padding: '12px 16px',
            color: 'var(--text-muted)', transition: 'all 0.2s'
          }}
        >
          <Settings size={20} style={{ marginRight: '12px' }} />
          Settings
        </Link>
      </div>
    </aside>
    <div 
      className="sidebar-overlay" 
      onClick={() => {
        document.querySelector('.sidebar')?.classList.remove('open');
        document.querySelector('.sidebar-overlay')?.classList.remove('open');
      }}
    />
    </>
  );
}
