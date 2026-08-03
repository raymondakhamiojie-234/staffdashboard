'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function PayrollClient({ staff }: { staff: any[] }) {
  const router = useRouter();

  // New salary form state
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);

  // Update status modal state
  const [updatingSalary, setUpdatingSalary] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const handleCreateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, currency, effectiveDate, status })
      });

      if (!res.ok) throw new Error('Failed to create payroll record');
      
      setAmount('');
      setEffectiveDate('');
      setUserId('');
      router.refresh();
      window.location.reload();
    } catch (error) {
      alert('Error creating payroll record');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingSalary) return;

    try {
      await fetch('/api/admin/payroll', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salaryId: updatingSalary.id, status: newStatus, adminNote })
      });
      setUpdatingSalary(null);
      setAdminNote('');
      router.refresh();
      window.location.reload();
    } catch (error) {
      alert('Error updating payroll');
    }
  };

  return (
    <div>
      <h1 className="page-title">Payroll Management</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Track salaries, issue payslips, and manage staff compensation.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Create Payroll Record */}
        <div>
          <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
            <h3 className="section-title">New Salary Record</h3>
            <form onSubmit={handleCreateSalary}>
              <div className="input-group">
                <label className="input-label">Select Staff</label>
                <select className="input-field" value={userId} onChange={e => setUserId(e.target.value)} required>
                  <option value="" disabled>Select Staff Member</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ flex: 2 }}>
                  <label className="input-label">Amount</label>
                  <input type="number" step="0.01" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} required />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Currency</label>
                  <select className="input-field" value={currency} onChange={e => setCurrency(e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="NGN">NGN</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Effective Date</label>
                <input type="date" className="input-field" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} required />
              </div>

              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <label className="input-label">Status</label>
                <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="paid">Paid</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Saving...' : 'Add Salary Record'}
              </button>
            </form>
          </div>
        </div>

        {/* Staff Payroll List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {staff.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No staff available.</p>
          ) : (
            staff.map(user => (
              <div key={user.id} className="glass-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>{user.fullName}</h3>
                
                {user.salaries?.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.5rem', fontWeight: 500 }}>Amount</th>
                        <th style={{ padding: '0.5rem', fontWeight: 500 }}>Date</th>
                        <th style={{ padding: '0.5rem', fontWeight: 500 }}>Status</th>
                        <th style={{ padding: '0.5rem', fontWeight: 500, textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.salaries.map((salary: any) => (
                        <tr key={salary.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                            {salary.currency} {parseFloat(salary.amount).toLocaleString()}
                            {salary.adminNote && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Note: {salary.adminNote}</div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(salary.effectiveDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ 
                              padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                              background: salary.status === 'paid' ? 'rgba(16,185,129,0.1)' : salary.status === 'suspended' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                              color: salary.status === 'paid' ? 'var(--secondary)' : salary.status === 'suspended' ? 'var(--danger)' : 'var(--warning)'
                            }}>
                              {salary.status.toUpperCase()}
                            </span>
                            
                            {/* History view */}
                            {salary.statusHistory && salary.statusHistory.length > 0 && (
                              <div style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '8px' }}>
                                {salary.statusHistory.map((history: any) => (
                                  <div key={history.id} style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                                    <Clock size={10} style={{ marginTop: '2px' }} />
                                    <span>{new Date(history.createdAt).toLocaleDateString()} - <strong style={{ color: 'white' }}>{history.status.toUpperCase()}</strong></span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <button 
                              onClick={() => {
                                setUpdatingSalary(salary);
                                setNewStatus(salary.status);
                                setAdminNote(salary.adminNote || '');
                              }}
                              className="btn" 
                              style={{ padding: '4px 12px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)' }}
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No salary records found for this user.</p>
                )}
              </div>
            ))
          )}
        </div>
        
      </div>

      {/* Update Status Modal */}
      {updatingSalary && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '400px', maxWidth: '90%' }}>
            <h3 className="section-title">Update Payroll Status</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Updating {updatingSalary.currency} {updatingSalary.amount}
            </p>
            <form onSubmit={handleUpdateStatus}>
              <div className="input-group">
                <label className="input-label">Status</label>
                <select className="input-field" value={newStatus} onChange={e => setNewStatus(e.target.value)} required>
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="paid">Paid</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <label className="input-label">Admin Note (Reason for suspend, etc.)</label>
                <textarea className="input-field" rows={3} value={adminNote} onChange={e => setAdminNote(e.target.value)}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn" onClick={() => setUpdatingSalary(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

