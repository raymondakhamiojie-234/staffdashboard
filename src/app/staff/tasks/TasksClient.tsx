'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TasksClient({ tasks }: { tasks: any[] }) {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  
  const [reportType, setReportType] = useState('daily');
  const [reportContent, setReportContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/staff/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTask.id,
          type: reportType,
          content: reportContent
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit report');
      }

      setReportContent('');
      setSelectedTask(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">My Tasks</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No tasks assigned.</p>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                className="glass-card" 
                style={{ 
                  cursor: 'pointer', 
                  border: selectedTask?.id === task.id ? '1px solid var(--primary)' : undefined,
                  borderLeft: `4px solid ${task.status === 'completed' ? 'var(--secondary)' : 'var(--warning)'}`
                }}
                onClick={() => setSelectedTask(task)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{task.title}</h3>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                    background: task.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: task.status === 'completed' ? 'var(--secondary)' : 'var(--warning)'
                  }}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Assigned by: {task.assignedBy?.fullName} • Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                </p>
                <p style={{ fontSize: '0.875rem' }}>{task.description}</p>
                
                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {task.reports?.length} Reports Submitted
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          {selectedTask ? (
            <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
              <h3 className="section-title">Submit Report for: {selectedTask.title}</h3>
              
              {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
              
              <form onSubmit={submitReport}>
                <div className="input-group">
                  <label className="input-label">Report Type</label>
                  <select className="input-field" value={reportType} onChange={e => setReportType(e.target.value)}>
                    <option value="daily">Daily Report</option>
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: '2rem' }}>
                  <label className="input-label">Report Content</label>
                  <textarea 
                    className="input-field" 
                    rows={6} 
                    required 
                    placeholder="Describe your progress, blockers, or completed milestones..."
                    value={reportContent}
                    onChange={e => setReportContent(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
              
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Previous Reports</h4>
                {selectedTask.reports?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedTask.reports.map((r: any) => (
                      <div key={r.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span style={{ textTransform: 'capitalize' }}>{r.type}</span>
                          <span>{new Date(r.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: '0.875rem' }}>{r.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No reports submitted yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', position: 'sticky', top: '100px' }}>
              Select a task to view details and submit reports.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
