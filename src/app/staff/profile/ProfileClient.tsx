'use client';

import { Printer } from 'lucide-react';

export default function ProfileClient({ user }: { user: any }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; color: black !important; }
          .sidebar, .top-header, .no-print { display: none !important; }
          .content-area { padding: 0 !important; }
          .glass-card { 
            background: white !important; 
            box-shadow: none !important; 
            border: 1px solid #ddd !important; 
            color: black !important;
          }
          * { color: black !important; }
        }
      `}} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Professional Profile</h1>
        <button className="btn btn-secondary no-print" onClick={handlePrint} style={{ display: 'flex', gap: '8px' }}>
          <Printer size={18} /> Download CV (PDF)
        </button>
      </div>

      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '2rem', marginBottom: '2rem' }}>
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', fontWeight: 'bold', color: 'white'
          }}>
            {user.fullName.charAt(0)}
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user.fullName}</h2>
          <p style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '1.125rem' }}>{user.role.name} at Falcus Media</p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
            <span>{user.email}</span>
            {user.phone && (
              <>
                <span>•</span>
                <span>{user.phone}</span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '2rem' }}>
          <div>
            <h3 className="section-title" style={{ color: 'var(--primary)' }}>Work Background</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{user.workBackground || 'No work background provided.'}</p>
          </div>

          <div>
            <h3 className="section-title" style={{ color: 'var(--primary)' }}>Education</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{user.education || 'No education provided.'}</p>
          </div>

          <div style={{ display: 'flex', gap: '4rem' }}>
            <div style={{ flex: 1 }}>
              <h3 className="section-title" style={{ color: 'var(--primary)' }}>Skills</h3>
              <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.6 }}>
                {user.skills ? user.skills.split(',').map((skill: string, i: number) => (
                  <li key={i}>{skill.trim()}</li>
                )) : <li>No skills provided.</li>}
              </ul>
            </div>

            <div style={{ flex: 1 }}>
              <h3 className="section-title" style={{ color: 'var(--primary)' }}>Hobbies</h3>
              <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.6 }}>
                {user.hobbies ? user.hobbies.split(',').map((hobby: string, i: number) => (
                  <li key={i}>{hobby.trim()}</li>
                )) : <li>No hobbies provided.</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
