'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Trash2 } from 'lucide-react';

export default function RecycleBinClient({ initialUsers }: { initialUsers: any[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);

  const handleRestore = async (userId: number) => {
    if (!confirm('Are you sure you want to restore this staff member? They will regain their access.')) return;
    
    try {
      const res = await fetch(`/api/admin/staff/${userId}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to restore staff member');
      
      setUsers(users.filter(u => u.id !== userId));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex-wrap-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Recycle Bin</h1>
          <p style={{ color: 'var(--text-muted)' }}>View and restore deleted staff accounts.</p>
        </div>
      </div>

      <div className="glass-card" style={{ overflowX: 'auto' }}>
        {users.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Trash2 size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>The recycle bin is empty.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Name / Email</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Position</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Deleted On</th>
                <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{user.fullName}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                      background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)'
                    }}>
                      {user.role?.name || 'No Role'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--danger)' }}>
                    {user.deletedAt ? new Date(user.deletedAt).toLocaleDateString() : 'Unknown'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleRestore(user.id)}
                      className="btn" 
                      style={{ padding: '6px 12px', fontSize: '0.875rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      <RotateCcw size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
