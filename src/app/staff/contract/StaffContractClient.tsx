'use client';

import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';
import { useState } from 'react';

export default function StaffContractClient({ contract, user }: { contract: any, user: any }) {
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      doc.setFontSize(20);
      doc.text("Employment Agreement", 40, 40);
      
      doc.setFontSize(12);
      doc.text(`Employee: ${user.fullName || user.email}`, 40, 70);
      doc.text(`Date Signed: ${new Date(contract.signedAt).toLocaleDateString()}`, 40, 90);

      const splitText = doc.splitTextToSize(
        contract.contractTemplate.content.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n'), // Simple strip HTML
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
      
      doc.save('Falcus_Media_Employment_Agreement.pdf');
    } catch (error) {
      console.error(error);
      alert('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{contract.contractTemplate.title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Signed on {new Date(contract.signedAt).toLocaleString()}
          </p>
        </div>
        <button onClick={downloadPDF} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} disabled={downloading}>
          <Download size={18} />
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      <div style={{ background: 'white', color: 'black', padding: '3rem 4rem', borderRadius: '8px', border: '1px solid #ccc' }}>
        <div dangerouslySetInnerHTML={{ __html: contract.contractTemplate.content }} />
        
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
          <h4>Digital Signature:</h4>
          {contract.signatureHash && contract.signatureHash.startsWith('data:image') ? (
            <img src={contract.signatureHash} alt="Signature" style={{ maxHeight: '80px', marginTop: '1rem' }} />
          ) : contract.signatureHash && contract.signatureHash.startsWith('TYPED::') ? (
            <p style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '2rem', marginTop: '1rem' }}>
              {contract.signatureHash.replace('TYPED::', '')}
            </p>
          ) : (
            <p style={{ fontStyle: 'italic', color: '#666' }}>No signature data found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
