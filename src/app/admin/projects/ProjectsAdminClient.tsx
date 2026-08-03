'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban, Plus, Users, Calendar, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsAdminClient({ initialProjects, staff }: { initialProjects: any[], staff: any[] }) {
  const router = useRouter();
  
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('planning');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, description, status, 
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null
        })
      });
      if (res.ok) {
        setIsCreating(false);
        setName('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create project');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      alert('Failed to delete project');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Projects & Teams</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage organizational projects and team members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {isCreating && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 className="section-title">Create New Project</h3>
          <form onSubmit={handleCreate}>
            <div className="input-group">
              <label className="input-label">Project Name</label>
              <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input-field" rows={3} value={description} onChange={e => setDescription(e.target.value)} required></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Status</label>
                <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Start Date</label>
                <input type="date" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">End Date</label>
                <input type="date" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn" onClick={() => setIsCreating(false)} style={{ background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Project'}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {initialProjects.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No projects found. Create one to get started.</p>
        ) : (
          initialProjects.map(project => (
            <div key={project.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                    <FolderKanban size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{project.name}</h3>
                    <span style={{ 
                      fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600,
                      background: project.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.1)',
                      color: project.status === 'active' ? 'var(--secondary)' : 'var(--text-muted)'
                    }}>
                      {project.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(project.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1 }}>
                {project.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} /> {project.members?.length || 0} Members
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} /> {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No deadline'}
                </div>
              </div>

              <Link href={`/admin/projects/${project.id}`} className="btn btn-primary" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                Manage Project
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
