'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Clock } from 'lucide-react';
import ReportReplies from '@/components/ReportReplies';

export default function TasksClient({ tasks }: { tasks: any[] }) {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  
  const [reportType, setReportType] = useState('daily');
  const [reportContent, setReportContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadingTaskFileId, setUploadingTaskFileId] = useState<number | null>(null);

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
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (taskId: number, file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be smaller than 5MB.');
      return;
    }

    setUploadingTaskFileId(taskId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', taskId.toString());

      const res = await fetch('/api/upload/task-file', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      router.refresh();
      window.location.reload();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploadingTaskFileId(null);
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{task.title}</h3>
                    {task.priority === 'primary' && (
                      <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'var(--danger)', color: 'white', borderRadius: '4px', fontWeight: 600 }}>PRIMARY</span>
                    )}
                  </div>
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
                
                {/* Embedded File List for quick view */}
                {task.files && task.files.length > 0 && (
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {task.files.map((file: any) => (
                       <a key={file.id} href={file.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', color: 'var(--primary)' }} onClick={(e) => e.stopPropagation()}>
                         <FileText size={12} /> {file.fileName}
                       </a>
                    ))}
                  </div>
                )}
                
                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {task.reports?.length || 0} Reports Submitted
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          {selectedTask ? (
            <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
              <h3 className="section-title">Task Details: {selectedTask.title}</h3>

              {/* Task Files Section */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Attached Files</h4>
                  <div>
                    <input type="file" id={`file-upload-staff-${selectedTask.id}`} accept="application/pdf" style={{ display: 'none' }} onChange={(e) => {
                      if (e.target.files && e.target.files[0]) handleFileUpload(selectedTask.id, e.target.files[0]);
                    }} />
                    <label htmlFor={`file-upload-staff-${selectedTask.id}`} className="btn btn-primary" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.75rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {uploadingTaskFileId === selectedTask.id ? 'Uploading...' : <><Upload size={14} /> Upload PDF</>}
                    </label>
                  </div>
                </div>
                {selectedTask.files && selectedTask.files.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedTask.files.map((file: any) => (
                      <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <FileText size={16} color="var(--primary)" />
                        <a href={file.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{file.fileName}</a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No files attached.</p>
                )}
              </div>
              
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
                        <ReportReplies reportId={r.id} initialReplies={r.replies || []} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> No reports submitted yet.</p>
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

