'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RoadmapClient({ initialItems }: { initialItems: any[] }) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('planning');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, targetDate, status })
      });

      if (!res.ok) throw new Error('Failed to create roadmap item');
      
      setTitle('');
      setDescription('');
      setTargetDate('');
      setStatus('planning');
      router.refresh();
    } catch (error) {
      alert('Error creating roadmap item');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await fetch('/api/admin/roadmap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      router.refresh();
    } catch (error) {
      alert('Error updating status');
    }
  };

  return (
    <div>
      <h1 className="page-title">Company Roadmap</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Define milestones, track progress, and align your team on company goals.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Create Form */}
        <div>
          <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
            <h3 className="section-title">Add Milestone</h3>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" rows={3} value={description} onChange={e => setDescription(e.target.value)} required />
              </div>

              <div className="input-group">
                <label className="input-label">Target Date</label>
                <input type="date" className="input-field" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
              </div>

              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <label className="input-label">Initial Status</label>
                <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Adding...' : 'Add Milestone'}
              </button>
            </form>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {initialItems.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No milestones defined yet.</p>
          ) : (
            initialItems.map(item => (
              <div key={item.id} className="glass-card" style={{ 
                borderLeft: `4px solid ${
                  item.status === 'completed' ? 'var(--secondary)' : 
                  item.status === 'in_progress' ? 'var(--primary)' : 'var(--warning)'
                }` 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{item.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select 
                      className="input-field" 
                      style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto', marginBottom: 0, width: 'auto' }}
                      value={item.status}
                      onChange={e => updateStatus(item.id, e.target.value)}
                    >
                      <option value="planning">Planning</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Target: {item.targetDate ? new Date(item.targetDate).toLocaleDateString() : 'TBD'}
                </p>
                <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{item.description}</p>
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}
