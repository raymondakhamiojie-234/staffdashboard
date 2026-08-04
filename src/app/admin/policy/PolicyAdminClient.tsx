'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle } from 'lucide-react';

export default function PolicyAdminClient({ latestPolicy, recentAcks }: { latestPolicy: any, recentAcks: any[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(latestPolicy?.title || 'Company Handbook & Policies');
  const [content, setContent] = useState(latestPolicy?.content || '');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!latestPolicy);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("Title and content are required.");
    
    if (!confirm("Publishing a new policy will require all staff to re-acknowledge it upon their next login. Continue?")) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      if (!res.ok) throw new Error('Failed to publish policy');
      
      setIsEditing(false);
      router.refresh();
      alert("Policy published successfully! Staff have been notified.");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex-wrap-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Company Policy</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your company's official handbook and policies.</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={16} /> Edit & Publish New Policy
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', gridColumn: 'span 2' }}>
          {isEditing ? (
            <form onSubmit={handlePublish}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Draft Company Policy</h2>
              
              <div className="input-group">
                <label className="input-label">Policy Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  placeholder="e.g. Employee Code of Conduct & Policies"
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">Policy Content</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Enter the terms of the policy. You can use standard text with line breaks. HTML tags like &lt;h3&gt; and &lt;ul&gt; are also supported if you want formatting.
                </p>
                <textarea 
                  className="input-field" 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  required 
                  rows={20}
                  placeholder="1. Working Hours&#10;2. Leave Policy..."
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                {latestPolicy && (
                  <button type="button" onClick={() => setIsEditing(false)} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>Cancel</button>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish to All Staff'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>{latestPolicy.title}</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Published on {new Date(latestPolicy.createdAt).toLocaleDateString()} at {new Date(latestPolicy.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: 'var(--secondary)' }}>
                  <CheckCircle size={14} /> ACTIVE
                </span>
              </div>
              
              <div 
                style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '2rem', 
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  maxHeight: '600px',
                  overflowY: 'auto'
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: latestPolicy.content.replace(/\n/g, '<br />') }} />
              </div>
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Recent Acknowledgements</h2>
          
          {recentAcks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No staff have acknowledged policies yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentAcks.map(ack => (
                <div key={ack.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{ack.user.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ack.user.role.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <CheckCircle size={12} /> Acknowledged
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {new Date(ack.acknowledgedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
