'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, CheckCircle } from 'lucide-react';

export default function PayrollClient({ staff }: { staff: any[] }) {
  const router = useRouter();

  // New salary form state
  const [userId, setUserId] = useState('');
  const [baseAmount, setBaseAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);

  const handleCreateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, baseAmount, currency, effectiveDate, status })
      });

      if (!res.ok) throw new Error('Failed to create payroll record');
      
      setBaseAmount('');
      setEffectiveDate('');
      setUserId('');
      router.refresh();
    } catch (error) {
      alert('Error creating payroll record');
    } finally {
      setLoading(false);
    }
  };

  const markPaid = async (salaryId: number) => {
    try {
      await fetch('/api/admin/payroll', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salaryId, status: 'paid' })
      });
      router.refresh();
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
                  <input type="number" step="0.01" className="input-field" value={baseAmount} onChange={e => setBaseAmount(e.target.value)} required />
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
                  <option value="paid">Paid</option>
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
                            {salary.currency} {parseFloat(salary.baseAmount).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(salary.effectiveDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ 
                              padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                              background: salary.status === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                              color: salary.status === 'paid' ? 'var(--secondary)' : 'var(--warning)'
                            }}>
                              {salary.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            {salary.status !== 'paid' && (
                              <button 
                                onClick={() => markPaid(salary.id)}
                                className="btn" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--secondary)', color: 'white' }}
                              >
                                Mark Paid
                              </button>
                            )}
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
    </div>
  );
}
