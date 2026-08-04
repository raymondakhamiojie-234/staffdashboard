'use client';

import { jsPDF } from 'jspdf';
import { Download, Search, CheckCircle, Clock, Plus, FileSignature, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContractsAdminClient({ 
  initialContracts, 
  templates, 
  uncontractedStaff 
}: { 
  initialContracts: any[],
  templates: any[],
  uncontractedStaff: any[]
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const [loading, setLoading] = useState(false);
  
  // Template Form
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateContent, setTemplateContent] = useState('');

  // Assign Form
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

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

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/contracts/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: templateTitle, content: templateContent })
      });
      if (!res.ok) throw new Error('Failed to create template');
      
      setShowTemplateModal(false);
      setTemplateTitle('');
      setTemplateContent('');
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedTemplateId) return alert("Select user and template");
    setLoading(true);
    try {
      const res = await fetch('/api/admin/contracts/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, templateId: selectedTemplateId })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to assign contract');
      }
      setShowAssignModal(false);
      setSelectedUserId('');
      setSelectedTemplateId('');
      router.refresh();
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
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Staff Contracts</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor and assign digital employment agreements.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setShowTemplateModal(true)} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Create Template
          </button>
          <button onClick={() => setShowAssignModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSignature size={16} /> Assign Contract
          </button>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Staff Member</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Template Name</th>
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
                  <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{contract.contractTemplate.title}</td>
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
                      <Download size={14} /> PDF
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

      {/* CREATE TEMPLATE MODAL */}
      {showTemplateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create Contract Template</h2>
              <button onClick={() => setShowTemplateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTemplate}>
              <div className="input-group">
                <label className="input-label">Template Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={templateTitle} 
                  onChange={e => setTemplateTitle(e.target.value)} 
                  required 
                  placeholder="e.g. Standard Employment Agreement"
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">Contract Body</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Enter the terms of the contract. You can use standard text with line breaks.
                </p>
                <textarea 
                  className="input-field" 
                  value={templateContent} 
                  onChange={e => setTemplateContent(e.target.value)} 
                  required 
                  rows={12}
                  placeholder="1. Position and Duties&#10;2. Compensation..."
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowTemplateModal(false)} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Save Template'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN CONTRACT MODAL */}
      {showAssignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Assign Contract</h2>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAssignContract}>
              <div className="input-group">
                <label className="input-label">Select Staff Member</label>
                <select 
                  className="input-field" 
                  value={selectedUserId} 
                  onChange={e => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">-- Choose a staff member --</option>
                  {uncontractedStaff.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.fullName} ({staff.email})</option>
                  ))}
                </select>
                {uncontractedStaff.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.5rem' }}>All active staff members already have contracts.</p>
                )}
              </div>
              
              <div className="input-group">
                <label className="input-label">Select Contract Template</label>
                <select 
                  className="input-field" 
                  value={selectedTemplateId} 
                  onChange={e => setSelectedTemplateId(e.target.value)}
                  required
                >
                  <option value="">-- Choose a template --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
                {templates.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.5rem' }}>No templates found. Please create one first.</p>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading || uncontractedStaff.length === 0 || templates.length === 0}
                >
                  {loading ? 'Assigning...' : 'Assign to Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
