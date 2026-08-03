'use client';

import { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AttendanceClient() {
  const router = useRouter();
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    fetchReport(date);
  }, [date]);

  const fetchReport = async (targetDate: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attendance?date=${targetDate}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!confirm(`Are you sure you want to run the penalty check for ${date}? This will deduct 2 days of salary for all absent staff.`)) return;
    
    setEvaluating(true);
    try {
      const res = await fetch('/api/admin/attendance/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
    } catch (err: any) {
      alert(err.message || 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  const presentCount = report.filter(r => r.status === 'present').length;
  const absentCount = report.filter(r => r.status === 'absent').length;

  return (
    <div>
      <h1 className="page-title">Daily Attendance</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        View staff check-ins and process salary penalties for missed attendance.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
        <div className="input-group" style={{ marginBottom: 0, flex: 1, maxWidth: '250px' }}>
          <label className="input-label">Select Date</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="date" 
              className="input-field" 
              style={{ paddingLeft: '40px' }}
              value={date}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setDate(e.target.value)}
            />
          </div>
        </div>
        <button 
          onClick={handleEvaluate} 
          disabled={evaluating || loading}
          className="btn btn-primary" 
          style={{ background: 'var(--warning)', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <AlertCircle size={18} />
          {evaluating ? 'Processing...' : 'Run Penalty Check'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{presentCount}</div>
          <div style={{ color: 'var(--text-muted)' }}>Present</div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{absentCount}</div>
          <div style={{ color: 'var(--text-muted)' }}>Absent</div>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Staff Name</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Check-in Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
            ) : report.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No active staff found.</td></tr>
            ) : (
              report.map(r => (
                <tr key={r.userId} style={{ borderTop: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{r.fullName}</td>
                  <td style={{ padding: '1rem' }}>
                    {r.status === 'present' ? (
                      <span style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: 600 }}>
                        <CheckCircle size={14} /> Present
                      </span>
                    ) : (
                      <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: 600 }}>
                        <XCircle size={14} /> Absent
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
