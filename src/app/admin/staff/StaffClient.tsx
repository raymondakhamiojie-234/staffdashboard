'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export default function StaffClient({ initialUsers, roles: initialRoles }: { initialUsers: any[], roles: any[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [roles, setRoles] = useState(initialRoles);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  
  const [roleId, setRoleId] = useState<number | ''>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [salaryAmount, setSalaryAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  // New Position State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleIsAdmin, setNewRoleIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setRoleId(user.roleId);
    setIsActive(user.isActive);
    setSalaryAmount(user.salaries?.[0]?.amount || '');
  };

  const saveChanges = async () => {
    if (!editingUser) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editingUser.id, roleId, isActive, salaryAmount })
      });

      if (!res.ok) throw new Error('Failed to update user');

      const data = await res.json();
      
      setUsers(users.map(u => u.id === editingUser.id ? data.user : u));
      setEditingUser(null);
      router.refresh();
    } catch (err) {
      alert('Error updating user');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return alert("Role name is required");
    setRoleLoading(true);

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoleName, isAdmin: newRoleIsAdmin })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create role');
      }

      const data = await res.json();
      setRoles([...roles, data.role]);
      setShowRoleModal(false);
      setNewRoleName('');
      setNewRoleIsAdmin(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage staff accounts, assign positions, set salaries, and handle access control.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowRoleModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Create Position
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Users List */}
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Name / Email</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Position</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Salary</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{user.fullName}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                      background: user.role?.isAdmin ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      color: user.role?.isAdmin ? 'var(--danger)' : 'var(--primary)'
                    }}>
                      {user.role?.name || 'No Role'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    {user.salaries?.[0] ? `$${user.salaries[0].amount.toLocaleString()}` : '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: user.isActive ? 'var(--secondary)' : 'var(--danger)'
                      }}></div>
                      <span style={{ fontSize: '0.875rem' }}>{user.isActive ? 'Active' : 'Suspended'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleEdit(user)}
                      className="btn" 
                      style={{ padding: '6px 12px', fontSize: '0.875rem', background: 'rgba(255,255,255,0.1)' }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Panel */}
        <div>
          {editingUser ? (
            <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
              <h3 className="section-title">Edit Staff Details</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{editingUser.fullName}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{editingUser.email}</div>
              </div>

              <div className="input-group">
                <label className="input-label">Assign Position</label>
                <select 
                  className="input-field" 
                  value={roleId} 
                  onChange={e => setRoleId(Number(e.target.value))}
                >
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Salary Amount ($)</label>
                <input 
                  type="number"
                  className="input-field"
                  placeholder="e.g. 5000"
                  value={salaryAmount}
                  onChange={e => setSalaryAmount(e.target.value ? Number(e.target.value) : '')}
                />
              </div>

              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <label className="input-label">Account Status</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="isActive" 
                      checked={isActive === true} 
                      onChange={() => setIsActive(true)}
                    />
                    Active
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="isActive" 
                      checked={isActive === false} 
                      onChange={() => setIsActive(false)}
                    />
                    Suspended
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }} 
                  onClick={saveChanges}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="btn" 
                  style={{ background: 'transparent', border: '1px solid var(--surface-border)' }} 
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', position: 'sticky', top: '100px' }}>
              Select a staff member to edit their position and salary.
            </div>
          )}
        </div>
      </div>

      {showRoleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Position</h3>
            
            <div className="input-group">
              <label className="input-label">Position Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Senior Developer" 
                value={newRoleName} 
                onChange={e => setNewRoleName(e.target.value)} 
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={newRoleIsAdmin} 
                  onChange={e => setNewRoleIsAdmin(e.target.checked)} 
                />
                Grant Administrator Privileges
              </label>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Users in this role will have access to the admin dashboard.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowRoleModal(false)} style={{ background: 'transparent' }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateRole} disabled={roleLoading}>
                {roleLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
