'use client';
import { useState, useEffect } from 'react';
import { Bell, Search, UserCircle, LogOut, Check, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header({ userName, role }: { userName: string, role: string }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const markAsRead = async (id?: number) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id })
    });
    fetchNotifications();
  };

  return (
    <header className="top-header">
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <button 
          className="menu-toggle"
          onClick={() => document.querySelector('.sidebar')?.classList.toggle('open')}
        >
          <Menu size={24} />
        </button>
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
        
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', position: 'relative' }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', top: '-2px', right: '-2px', 
                width: '8px', height: '8px', background: 'var(--danger)', 
                borderRadius: '50%' 
              }}></span>
            )}
          </button>

          {showDropdown && (
            <div className="glass-panel" style={{
              position: 'absolute', top: '40px', right: '-10px',
              width: '320px', padding: '1rem', zIndex: 100,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 600 }}>Notifications</h4>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAsRead()} 
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>No notifications.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ 
                      padding: '0.75rem', borderRadius: '8px',
                      background: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem'
                    }}>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: n.isRead ? 400 : 600 }}>{n.message}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                      {!n.isRead && (
                        <button onClick={() => markAsRead(n.id)} style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}>
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
