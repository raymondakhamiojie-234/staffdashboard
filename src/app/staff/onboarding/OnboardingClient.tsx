'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, FileSignature, BookOpen, CheckCircle } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

export default function OnboardingClient({ user, policy, contract }: { user: any, policy: any, contract: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Profile Form
  const [skills, setSkills] = useState(user.skills || '');
  const [hobbies, setHobbies] = useState(user.hobbies || '');
  const [education, setEducation] = useState(user.education || '');
  const [workBackground, setWorkBackground] = useState(user.workBackground || '');

  // Contract Form
  const sigCanvas = useRef<any>(null);
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState(user.fullName || '');
  const [hasReadContract, setHasReadContract] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/staff/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile', skills, hobbies, education, workBackground })
      });
      setStep(2);
      router.refresh();
    } catch (error) {
      alert('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const signContract = async () => {
    if (!hasReadContract) {
      alert("Please confirm that you have read the contract.");
      return;
    }
    
    let signatureData = '';
    if (signatureType === 'draw') {
      if (sigCanvas.current?.isEmpty()) {
        alert("Please provide your signature.");
        return;
      }
      signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    } else {
      if (!typedSignature.trim()) {
        alert("Please type your full legal name.");
        return;
      }
      signatureData = `TYPED::${typedSignature.trim()}`;
    }

    setLoading(true);
    try {
      await fetch('/api/staff/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contract', signatureData })
      });
      setStep(3);
      router.refresh();
    } catch (error) {
      alert('Failed to sign contract');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgePolicy = async () => {
    setLoading(true);
    try {
      await fetch('/api/staff/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'policy' })
      });
      router.push('/staff/dashboard');
    } catch (error) {
      alert('Failed to acknowledge policy');
    } finally {
      setLoading(false);
    }
  };

  // Determine actual starting step based on backend status
  if (user.profileStatus === 'completed' && step === 1) setStep(2);
  if (user.contractStatus === 'signed' && step === 2) setStep(3);
  if (user.policyStatus === 'acknowledged' && step === 3) {
    router.push('/staff/dashboard');
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="page-title">Welcome to Falcus Media</h1>
        <p style={{ color: 'var(--text-muted)' }}>Complete these steps to activate your account.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
        <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.1)', position: 'absolute', top: '50%', zIndex: 0, width: '100%' }}></div>
        {[
          { num: 1, label: 'Profile', icon: User, active: step >= 1 },
          { num: 2, label: 'Contract', icon: FileSignature, active: step >= 2 },
          { num: 3, label: 'Policy', icon: BookOpen, active: step >= 3 }
        ].map(s => (
          <div key={s.num} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--background)', padding: '0 1rem' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: s.active ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: s.active ? 'white' : 'var(--text-muted)'
            }}>
              <s.icon size={20} />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: s.active ? 'white' : 'var(--text-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {step === 1 && (
          <div>
            <h2 className="section-title">Step 1: Complete Your Profile</h2>
            <form onSubmit={saveProfile}>
              <div className="input-group">
                <label className="input-label">Education</label>
                <input type="text" className="input-field" value={education} onChange={e => setEducation(e.target.value)} required placeholder="BSc Computer Science, etc." />
              </div>
              <div className="input-group">
                <label className="input-label">Work Background</label>
                <textarea className="input-field" rows={3} value={workBackground} onChange={e => setWorkBackground(e.target.value)} required placeholder="Previous roles and experiences..."></textarea>
              </div>
              <div className="input-group">
                <label className="input-label">Skills</label>
                <input type="text" className="input-field" value={skills} onChange={e => setSkills(e.target.value)} required placeholder="React, Node.js, Marketing, etc." />
              </div>
              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <label className="input-label">Hobbies</label>
                <input type="text" className="input-field" value={hobbies} onChange={e => setHobbies(e.target.value)} required placeholder="Reading, Coding, Football..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile & Continue'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="section-title">Step 2: Sign Your Contract</h2>
            {contract ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div 
                  style={{ 
                    background: 'white', 
                    color: 'black', 
                    padding: '2rem', 
                    borderRadius: '8px', 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    border: '1px solid #ccc'
                  }}
                  onScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
                      // Optionally auto-check when scrolled to bottom
                    }
                  }}
                >
                  <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>{contract.contractTemplate.title}</h3>
                  <div dangerouslySetInnerHTML={{ __html: contract.contractTemplate.content || 'No content provided.' }} />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={hasReadContract} 
                    onChange={e => setHasReadContract(e.target.checked)} 
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span>I have read and understood the terms of this Employment Agreement.</span>
                </label>

                {hasReadContract && (
                  <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <button 
                        type="button"
                        onClick={() => setSignatureType('draw')}
                        className={`btn ${signatureType === 'draw' ? 'btn-primary' : ''}`}
                        style={{ flex: 1, background: signatureType !== 'draw' ? 'rgba(255,255,255,0.1)' : undefined }}
                      >
                        Draw Signature
                      </button>
                      <button 
                        type="button"
                        onClick={() => setSignatureType('type')}
                        className={`btn ${signatureType === 'type' ? 'btn-primary' : ''}`}
                        style={{ flex: 1, background: signatureType !== 'type' ? 'rgba(255,255,255,0.1)' : undefined }}
                      >
                        Type Signature
                      </button>
                    </div>

                    {signatureType === 'draw' ? (
                      <div style={{ border: '1px solid var(--surface-border)', borderRadius: '8px', background: 'white' }}>
                        <SignatureCanvas 
                          ref={sigCanvas} 
                          penColor="black"
                          canvasProps={{ width: 500, height: 150, className: 'sigCanvas', style: { width: '100%', borderRadius: '8px' } }}
                        />
                        <button 
                          type="button" 
                          onClick={() => sigCanvas.current?.clear()} 
                          style={{ margin: '0.5rem', fontSize: '0.8rem', color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Clear Canvas
                        </button>
                      </div>
                    ) : (
                      <div className="input-group">
                        <label className="input-label">Type your full legal name</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={typedSignature} 
                          onChange={e => setTypedSignature(e.target.value)} 
                          style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '1.5rem', padding: '1rem' }}
                        />
                      </div>
                    )}
                  </div>
                )}

                <button onClick={signContract} className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !hasReadContract}>
                  {loading ? 'Signing...' : 'Sign & Submit Contract'}
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--warning)', textAlign: 'center' }}>No contract has been assigned to you yet. Please contact an admin.</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="section-title">Step 3: Acknowledge Company Policy</h2>
            {policy ? (
              <div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto' }}>
                  <h3 style={{ marginBottom: '1rem' }}>{policy.title}</h3>
                  <div dangerouslySetInnerHTML={{ __html: policy.content }} />
                </div>
                <button onClick={acknowledgePolicy} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={loading}>
                  {loading ? 'Processing...' : <><CheckCircle size={18} /> I have read and accepted the policy</>}
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--warning)', textAlign: 'center' }}>No company policy has been published yet. Please contact an admin.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
