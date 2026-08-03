'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AttendanceButton({ hasMarkedToday }: { hasMarkedToday: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const markAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/attendance', {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert('Attendance marked successfully!');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  if (hasMarkedToday) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', fontWeight: 600 }}>
        <CheckCircle size={20} />
        Attendance Marked for Today
      </div>
    );
  }

  return (
    <button 
      onClick={markAttendance}
      disabled={loading}
      className="btn btn-primary"
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      <CheckCircle size={18} />
      {loading ? 'Marking...' : 'Mark Attendance for Today'}
    </button>
  );
}
