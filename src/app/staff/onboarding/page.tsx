'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Profile Form Data
  const [skills, setSkills] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [education, setEducation] = useState('');
  const [workBackground, setWorkBackground] = useState('');

  const submitProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/staff/onboarding/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, hobbies, education, workBackground }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signContract = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/staff/onboarding/contract', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to sign contract');
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgePolicy = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/staff/onboarding/policy', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to acknowledge policies');
      
      // All done! Refresh to get the new cookie and pass middleware
      router.push('/staff/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title">Welcome to Falcus Media</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Before you can access your dashboard, we need you to complete three quick steps.
      </p>

      {/* Progress Indicator */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ 
            flex: 1, 
            height: '4px', 
            background: step >= i ? 'var(--primary)' : 'var(--surface-border)',
            borderRadius: '2px',
            transition: 'background 0.3s ease'
          }} />
        ))}
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-card">
        {step === 1 && (
          <div>
            <h2 className="section-title">Step 1: Complete Your Profile</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Tell us a bit about yourself so we can populate your internal CV.</p>
            
            <div className="input-group">
              <label className="input-label">Skills (comma separated)</label>
              <input type="text" className="input-field" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React, Node, Design" />
            </div>
            
            <div className="input-group">
              <label className="input-label">Education Background</label>
              <textarea className="input-field" value={education} onChange={e => setEducation(e.target.value)} rows={3} placeholder="BSc Computer Science..." />
            </div>

            <div className="input-group">
              <label className="input-label">Work Background</label>
              <textarea className="input-field" value={workBackground} onChange={e => setWorkBackground(e.target.value)} rows={3} placeholder="Previous experience..." />
            </div>

            <div className="input-group">
              <label className="input-label">Hobbies</label>
              <input type="text" className="input-field" value={hobbies} onChange={e => setHobbies(e.target.value)} placeholder="Reading, Coding, Chess..." />
            </div>

            <button className="btn btn-primary" onClick={submitProfile} disabled={loading}>
              Save & Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="section-title">Step 2: Sign Your Employment Contract</h2>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', height: '200px', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '1rem' }}>Standard Employment Agreement</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                By clicking "I Agree and Sign", you formally accept the terms of employment with Falcus Media. This digital signature serves as a legally binding acceptance of the contract terms provided in your offer letter.
                <br/><br/>
                Terms include:<br/>
                - Non-disclosure of internal company operations.<br/>
                - Dedication to assigned tasks.<br/>
                - Standard working hours and code of conduct.
              </p>
            </div>
            <button className="btn btn-primary" onClick={signContract} disabled={loading}>
              I Agree and Sign Digitally
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="section-title">Step 3: Company Policies</h2>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Please acknowledge that you have read and will abide by our core company policies:
                <br/><br/>
                1. <strong>Code of Conduct:</strong> Treat everyone with respect.<br/>
                2. <strong>Data Security:</strong> Never share sensitive company data.<br/>
                3. <strong>Communication:</strong> Maintain professional communication at all times.
              </p>
            </div>
            <button className="btn btn-primary" onClick={acknowledgePolicy} disabled={loading}>
              Acknowledge & Complete Onboarding
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
