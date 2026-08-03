'use client';

import { useState, useEffect } from 'react';
import { Send, User } from 'lucide-react';

export default function ReportReplies({ reportId, initialReplies = [] }: { reportId: number, initialReplies?: any[] }) {
  const [replies, setReplies] = useState(initialReplies);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Optionally fetch replies if not passed in initially, or use realtime
    const fetchReplies = async () => {
      const res = await fetch(`/api/reports/${reportId}/replies`);
      if (res.ok) {
        const data = await res.json();
        setReplies(data);
      }
    };
    if (initialReplies.length === 0) fetchReplies();
  }, [reportId, initialReplies.length]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        const data = await res.json();
        setReplies([...replies, data.reply]);
        setContent('');
      }
    } catch (error) {
      console.error('Failed to post reply', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
      {replies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {replies.map((reply: any) => (
            <div key={reply.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={12} /> {reply.sender?.fullName || 'User'}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {new Date(reply.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', margin: 0 }}>{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleReply} style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Reply to this report..." 
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{ padding: '8px 12px', fontSize: '0.875rem', flex: 1 }}
          required
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }} disabled={isSubmitting}>
          {isSubmitting ? '...' : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
