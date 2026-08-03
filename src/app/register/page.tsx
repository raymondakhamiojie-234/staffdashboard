'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    roleName: 'Staff'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Instead of auto-login, we could push to login page
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-layout">
      <div className="auth-banner">
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1px' }}>
          Join Falcus Media
        </h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '400px', lineHeight: 1.6 }}>
          Register to access your staff dashboard, manage tasks, and connect with your team.
        </p>
      </div>

      <div className="auth-form-container">
        <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '3rem 2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Fill in your details to register</p>

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--danger)', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                name="fullName"
                type="text" 
                className="input-field" 
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Company Email</label>
              <input 
                name="email"
                type="email" 
                className="input-field" 
                placeholder="john.doe@falcusmedia.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Password</label>
              <input 
                name="password"
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex-wrap-mobile" style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Phone Number</label>
                <input 
                  name="phone"
                  type="text" 
                  className="input-field" 
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Role</label>
                <select 
                  name="roleName" 
                  className="input-field" 
                  value={formData.roleName}
                  onChange={handleChange}
                >
                  <option value="Staff">Staff</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Admin">Admin (for testing)</option>
                  <option value="Founder">Founder</option>
                </select>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label className="input-label">Home Address</label>
              <input 
                name="address"
                type="text" 
                className="input-field" 
                placeholder="123 Media Ave"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
