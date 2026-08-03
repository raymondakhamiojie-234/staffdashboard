'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Send, Calendar, Clock } from 'lucide-react';

export default function ReportsClient({ tasks, myReports }: { tasks: any[], myReports: any[] }) {
  const router = useRouter();
  
  const [type, setType] = useState('daily');
  const [taskId, setTaskId] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return alert('Report content is required');

    setLoading(true);
    try {
      const res = await fetch('/api/staff/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, 
          taskId: taskId ? Number(taskId) : null,
          content 
        })
      });

      if (!res.ok) throw new Error('Failed to submit report');

      setContent('');
      setTaskId('');
      router.refresh();
      alert('Report submitted successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Activity Reports</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Submit your daily, weekly, or monthly reports to keep management updated on your progress.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Submit Form */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} className="text-primary" /> New Report
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Report Type</label>
              <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
                <option value="daily">Daily Report</option>
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Related Task (Optional)</label>
              <select className="input-field" value={taskId} onChange={e => setTaskId(e.target.value)}>
                <option value="">-- General Activity (No specific task) --</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title} ({t.status.replace('_', ' ')})</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Report Details</label>
              <textarea 
                className="input-field" 
                rows={6}
                placeholder="Describe your activities, challenges, and progress..."
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Send size={16} /> {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} className="text-secondary" /> Recent Submissions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myReports.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                No reports submitted yet.
              </div>
            ) : (
              myReports.map((report: any) => (
                <div key={report.id} style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--surface-border)', 
                  padding: '1rem', 
                  borderRadius: '12px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                      background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)',
                      textTransform: 'capitalize'
                    }}>
                      {report.type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(report.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {report.task && (
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px', color: 'var(--secondary)' }}>
                      Task: {report.task.title}
                    </div>
                  )}
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                    {report.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
