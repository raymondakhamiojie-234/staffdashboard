'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock } from 'lucide-react';

export default function TasksAdminClient({ initialTasks, staff }: { initialTasks: any[], staff: any[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, assignedToId, dueDate })
      });

      if (!res.ok) throw new Error('Failed to create task');
      
      // Reset form and refresh
      setTitle('');
      setDescription('');
      setAssignedToId('');
      setDueDate('');
      router.refresh();
    } catch (error) {
      alert('Error creating task');
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async (taskId: number) => {
    try {
      await fetch('/api/admin/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: 'completed' })
      });
      router.refresh();
      if (selectedTask?.id === taskId) setSelectedTask({ ...selectedTask, status: 'completed' });
    } catch (error) {
      alert('Error updating task');
    }
  };

  return (
    <div>
      <h1 className="page-title">Task Management</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Assign tasks to staff members and review their progress reports.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Column: Create Task Form */}
        <div>
          <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
            <h3 className="section-title">Assign New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label className="input-label">Task Title</label>
                <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Assign To</label>
                <select className="input-field" value={assignedToId} onChange={e => setAssignedToId(e.target.value)} required>
                  <option value="" disabled>Select Staff Member</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.role.name})</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Due Date</label>
                <input type="date" className="input-field" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <label className="input-label">Description</label>
                <textarea className="input-field" rows={4} value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Task'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Tasks List & Reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No tasks have been assigned yet.</p>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="glass-card" style={{ borderLeft: `4px solid ${task.status === 'completed' ? 'var(--secondary)' : 'var(--warning)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>{task.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Assigned to: <span style={{ color: 'white', fontWeight: 500 }}>{task.assignedTo.fullName}</span> • Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                      background: task.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: task.status === 'completed' ? 'var(--secondary)' : 'var(--warning)'
                    }}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {task.status !== 'completed' && (
                      <button 
                        onClick={() => markCompleted(task.id)}
                        className="btn" 
                        style={{ padding: '6px', background: 'var(--secondary)', color: 'white', borderRadius: '50%' }}
                        title="Mark Completed"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>{task.description}</p>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>Staff Reports ({task.reports?.length || 0})</h4>
                  
                  {task.reports?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {task.reports.map((r: any) => (
                        <div key={r.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'white' }}>{r.type} Report</span>
                            <span>{new Date(r.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{r.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} /> No reports submitted for this task yet.
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}
