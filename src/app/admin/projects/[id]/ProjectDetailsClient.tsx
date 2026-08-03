'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Kanban, Settings, Plus, UserPlus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailsClient({ project, staff }: { project: any, staff: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'kanban' | 'members' | 'settings'>('kanban');

  const [memberId, setMemberId] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberId, role: 'member' })
      });
      setMemberId('');
      router.refresh();
    } catch (error) {
      alert('Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const removeMember = async (userId: number) => {
    if (!confirm('Remove this member?')) return;
    try {
      await fetch(`/api/projects/${project.id}?userId=${userId}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      alert('Failed to remove member');
    }
  };

  const kanbanColumns = ['pending', 'in_progress', 'completed'];

  return (
    <div>
      <Link href="/admin/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>{project.name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{project.description}</p>
        </div>
        <span style={{ 
          padding: '4px 12px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600,
          background: project.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.1)',
          color: project.status === 'active' ? 'var(--secondary)' : 'var(--text-muted)'
        }}>
          {project.status.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--surface-border)', marginBottom: '2rem' }}>
        <button 
          className="btn"
          style={{ background: 'transparent', color: activeTab === 'kanban' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'kanban' ? '2px solid var(--primary)' : '2px solid transparent', borderRadius: 0, padding: '0.5rem 1rem' }}
          onClick={() => setActiveTab('kanban')}
        >
          <Kanban size={18} style={{ display: 'inline', marginRight: '8px' }} /> Kanban
        </button>
        <button 
          className="btn"
          style={{ background: 'transparent', color: activeTab === 'members' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'members' ? '2px solid var(--primary)' : '2px solid transparent', borderRadius: 0, padding: '0.5rem 1rem' }}
          onClick={() => setActiveTab('members')}
        >
          <Users size={18} style={{ display: 'inline', marginRight: '8px' }} /> Members
        </button>
        <button 
          className="btn"
          style={{ background: 'transparent', color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'settings' ? '2px solid var(--primary)' : '2px solid transparent', borderRadius: 0, padding: '0.5rem 1rem' }}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} style={{ display: 'inline', marginRight: '8px' }} /> Settings
        </button>
      </div>

      {activeTab === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {kanbanColumns.map(status => (
            <div key={status} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '1rem', minHeight: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'capitalize' }}>
                  {status.replace('_', ' ')}
                </h3>
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                  {project.tasks.filter((t: any) => t.status === status).length}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {project.tasks.filter((t: any) => t.status === status).map((task: any) => (
                  <div key={task.id} className="glass-card" style={{ padding: '1rem', cursor: 'grab' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{task.title}</h4>
                      {task.priority === 'primary' && <span style={{ fontSize: '0.65rem', background: 'var(--danger)', color: 'white', padding: '2px 4px', borderRadius: '4px' }}>PRIMARY</span>}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{task.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--primary)' }}>{task.assignedTo?.fullName || 'Unassigned'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 className="section-title">Project Members</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.5rem', fontWeight: 500 }}>Name</th>
                  <th style={{ padding: '0.5rem', fontWeight: 500 }}>Email</th>
                  <th style={{ padding: '0.5rem', fontWeight: 500 }}>Role</th>
                  <th style={{ padding: '0.5rem', fontWeight: 500, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {project.members.map((m: any) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{m.user.fullName}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{m.user.email}</td>
                    <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{m.role}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button onClick={() => removeMember(m.userId)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
            <h3 className="section-title">Add Member</h3>
            <form onSubmit={addMember}>
              <div className="input-group">
                <label className="input-label">Select Staff</label>
                <select className="input-field" value={memberId} onChange={e => setMemberId(e.target.value)} required>
                  <option value="" disabled>Select Staff Member</option>
                  {staff.filter((s: any) => !project.members.find((m: any) => m.userId === s.id)).map((s: any) => (
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={addingMember}>
                {addingMember ? 'Adding...' : <><UserPlus size={16} /> Add to Project</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
          <h3 className="section-title">Project Settings</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Update project details or change its status.</p>
          <div className="input-group">
            <label className="input-label">Project Name</label>
            <input type="text" className="input-field" defaultValue={project.name} disabled />
          </div>
          <div className="input-group">
            <label className="input-label">Status</label>
            <select className="input-field" defaultValue={project.status} disabled>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--warning)' }}>Settings update functionality is coming soon.</p>
        </div>
      )}
    </div>
  );
}
