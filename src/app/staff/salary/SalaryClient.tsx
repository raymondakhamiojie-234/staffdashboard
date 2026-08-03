'use client';

import { DollarSign, Download, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SalaryClient({ salaries }: { salaries: any[] }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="status-badge status-paid"><CheckCircle size={14} /> Paid</span>;
      case 'pending': return <span className="status-badge status-pending"><Clock size={14} /> Pending</span>;
      case 'suspended': return <span className="status-badge status-suspended"><AlertTriangle size={14} /> Suspended</span>;
      default: return <span className="status-badge status-pending">{status.toUpperCase()}</span>;
    }
  };

  return (
    <div>
      <h1 className="page-title">My Salary & Invoices</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>View your payment history and download payslips.</p>

      {salaries.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <DollarSign size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Salary Records Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>You do not have any salary records attached to your account yet.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Effective Date</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Amount</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Admin Note</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Payslip</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map((salary) => (
                  <tr key={salary.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px 12px', fontWeight: 500 }}>
                      {new Date(salary.effectiveDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px 12px', fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>
                      {salary.currency} {salary.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      {getStatusBadge(salary.status)}
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {salary.adminNote || '-'}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      {salary.invoice?.fileUrl ? (
                        <a 
                          href={salary.invoice.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Download size={14} /> Download PDF
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>Not Available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-paid {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .status-pending {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .status-suspended {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
}
