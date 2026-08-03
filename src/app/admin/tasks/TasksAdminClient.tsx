'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock, Trash2, Upload, FileText, AlertTriangle } from 'lucide-react';
import ReportReplies from '@/components/ReportReplies';

export default function TasksAdminClient({ initialTasks, staff }: { initialTasks: any[], staff: any[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks.filter(t => !t.isDeleted));
  
  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('primary');
  const [loading, setLoading] = useState(false);
  const [uploadingTaskFileId, setUploadingTaskFileId] = useState<number | null>(null);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, assignedToId, dueDate, priority })
      });

      if (!res.ok) throw new Error('Failed to create task');
      
      setTitle('');
      setDescription('');
      setAssignedToId('');
      setDueDate('');
      setPriority('primary');
      router.refresh();
      window.location.reload(); // Quick fix to ensure new data is fetched
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
      window.location.reload();
    } catch (error) {
      alert('Error updating task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task? This will move it to the archive.')) return;
    try {
      await fetch(`/api/admin/tasks?id=${taskId}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== taskId));
      router.refresh();
    } catch (error) {
      alert('Error deleting task');
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
                <label className="input-label">Priority</label>
                <select className="input-field" value={priority} onChange={e => setPriority(e.target.value)} required>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </select>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{task.title}</h3>
                      {task.priority === 'primary' && (
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--danger)', color: 'white', borderRadius: '4px', fontWeight: 600 }}>PRIMARY</span>
                      )}
                      {task.priority === 'secondary' && (
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', fontWeight: 600 }}>SECONDARY</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Assigned to: <span style={{ color: 'white', fontWeight: 500 }}>{task.assignedTo?.fullName}</span> • Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
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
                      <button onClick={() => markCompleted(task.id)} className="btn" style={{ padding: '6px', background: 'var(--secondary)', color: 'white', borderRadius: '50%' }} title="Mark Completed">
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button onClick={() => handleDeleteTask(task.id)} className="btn" style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '50%' }} title="Delete Task">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>{task.description}</p>

                {/* Task Files Section */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Attached Files</h4>
                    <div>
                      <input type="file" id={`file-upload-${task.id}`} accept="application/pdf" style={{ display: 'none' }} onChange={(e) => {
                        if (e.target.files && e.target.files[0]) handleFileUpload(task.id, e.target.files[0]);
                      }} />
                      <label htmlFor={`file-upload-${task.id}`} className="btn btn-primary" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.75rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {uploadingTaskFileId === task.id ? 'Uploading...' : <><Upload size={14} /> Upload PDF</>}
                      </label>
                    </div>
                  </div>
                  {task.files && task.files.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {task.files.map((file: any) => (
                        <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                          <FileText size={16} color="var(--primary)" />
                          <a href={file.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{file.fileName}</a>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({(file.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No files attached.</p>
                  )}
                </div>

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
                          <ReportReplies reportId={r.id} initialReplies={r.replies || []} />
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

