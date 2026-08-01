'use client';
import { Bell, Search, UserCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header({ userName, role }: { userName: string, role: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="top-header">
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          position: 'relative', width: '300px', 
          display: 'flex', alignItems: 'center' 
        }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="input-field"
            style={{ paddingLeft: '38px', marginBottom: 0, borderRadius: '20px', background: 'rgba(255,255,255,0.05)' }} 
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', position: 'relative' }}>
          <Bell size={20} />
          <span style={{ 
            position: 'absolute', top: '-2px', right: '-2px', 
            width: '8px', height: '8px', background: 'var(--danger)', 
            borderRadius: '50%' 
          }}></span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--surface-border)', paddingLeft: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{userName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{role}</div>
          </div>
          <UserCircle size={32} style={{ color: 'var(--primary)' }} />
          
          <button 
            onClick={handleLogout}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-muted)', 
              cursor: 'pointer', marginLeft: '10px' 
            }}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
