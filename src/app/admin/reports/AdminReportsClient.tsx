'use client';

import { useState } from 'react';
import { Activity, Search, Filter } from 'lucide-react';

export default function AdminReportsClient({ initialReports }: { initialReports: any[] }) {
  const [reports, setReports] = useState(initialReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.submittedBy.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || r.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <h1 className="page-title">Staff Activity Reports</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Review daily, weekly, and monthly activity reports submitted by staff members.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search by staff name or content..." 
              style={{ paddingLeft: '40px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="input-group" style={{ width: '200px', marginBottom: 0 }}>
          <select className="input-field" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredReports.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            No reports found matching your criteria.
          </div>
        ) : (
          filteredReports.map((report: any) => (
            <div key={report.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                  }}>
                    {report.submittedBy.fullName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{report.submittedBy.fullName}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {new Date(report.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
                <span style={{ 
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                  background: report.type === 'daily' ? 'rgba(16, 185, 129, 0.1)' : 
                              report.type === 'weekly' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: report.type === 'daily' ? '#10b981' : 
                         report.type === 'weekly' ? '#3b82f6' : '#f59e0b',
                  textTransform: 'capitalize'
                }}>
                  {report.type} Report
                </span>
              </div>
              
              {report.task && (
                <div style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--secondary)' }}>
                  <strong>Linked Task:</strong> {report.task.title}
                </div>
              )}

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-light)' }}>
                  {report.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
