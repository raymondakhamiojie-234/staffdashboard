export default function SettingsPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="page-title">Account Settings</h1>
      <p style={{ color: 'var(--text-muted)' }}>This feature is currently under construction. Stay tuned!</p>
      <div className="glass-card" style={{ marginTop: '2rem', maxWidth: '600px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Preferences</h3>
        <p style={{ color: 'var(--text-muted)' }}>Update your notification preferences and password.</p>
      </div>
    </div>
  );
}
