'use client';

import { jsPDF } from 'jspdf';
import { Download, Search, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function ContractsAdminClient({ initialContracts }: { initialContracts: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredContracts = initialContracts.filter(c => {
    const matchesSearch = c.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const downloadPDF = async (contract: any) => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      doc.setFontSize(20);
      doc.text("Employment Agreement", 40, 40);
      
      doc.setFontSize(12);
      doc.text(`Employee: ${contract.user.fullName || contract.user.email}`, 40, 70);
      if (contract.signedAt) {
        doc.text(`Date Signed: ${new Date(contract.signedAt).toLocaleDateString()}`, 40, 90);
      }

      const splitText = doc.splitTextToSize(
        contract.contractTemplate.content.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n'),
        500
      );
      
      let y = 130;
      for (let i = 0; i < splitText.length; i++) {
        if (y > 780) {
          doc.addPage();
          y = 40;
        }
        doc.text(splitText[i], 40, y);
        y += 15;
      }

      if (contract.status === 'signed') {
        if (y > 650) {
          doc.addPage();
          y = 40;
        }
        
        doc.setFontSize(14);
        doc.text("Signed By:", 40, y + 20);
        
        if (contract.signatureHash && contract.signatureHash.startsWith('data:image')) {
          doc.addImage(contract.signatureHash, 'PNG', 40, y + 30, 150, 45);
        } else if (contract.signatureHash && contract.signatureHash.startsWith('TYPED::')) {
          doc.setFont('times', 'italic');
          doc.setFontSize(24);
          doc.text(contract.signatureHash.replace('TYPED::', ''), 40, y + 50);
          doc.setFont('helvetica', 'normal');
        }
      }
      
      doc.save(`Contract_${contract.user.fullName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error(error);
      alert('Failed to generate PDF');
    }
  };

  return (
    <div>
      <h1 className="page-title">Staff Contracts</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Monitor and download digital employment agreements.</p>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div className="input-group" style={{ flex: 2, margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input 
                type="text" 
                placeholder="Search staff by name or email..." 
                className="input-field" 
                style={{ paddingLeft: '40px' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="input-group" style={{ flex: 1, margin: 0 }}>
            <select className="input-field" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Contracts</option>
              <option value="signed">Signed</option>
              <option value="pending">Pending Signature</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Staff Member</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Role</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Date Signed</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map(contract => (
                <tr key={contract.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ fontWeight: 600 }}>{contract.user.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{contract.user.email}</div>
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{contract.user.role.name}</td>
                  <td style={{ padding: '16px 12px' }}>
                    {contract.status === 'signed' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: 'var(--secondary)' }}>
                        <CheckCircle size={14} /> SIGNED
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>
                        <Clock size={14} /> PENDING
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>
                    {contract.signedAt ? new Date(contract.signedAt).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <button 
                      onClick={() => downloadPDF(contract)} 
                      disabled={contract.status !== 'signed'}
                      className="btn" 
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '0.875rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        background: contract.status === 'signed' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        cursor: contract.status === 'signed' ? 'pointer' : 'not-allowed',
                        opacity: contract.status === 'signed' ? 1 : 0.5
                      }}
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No contracts found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
