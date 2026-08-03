'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';

export default function AnalyticsClient({ 
  taskData, 
  scoreData 
}: { 
  taskData: any[], 
  scoreData: any[] 
}) {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Company Analytics</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Task Completion Chart */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 className="section-title">Task Completion Trends (Last 6 Months)</h2>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }} />
                <Legend />
                <Bar dataKey="completed" fill="var(--success)" name="Completed Tasks" />
                <Bar dataKey="overdue" fill="var(--danger)" name="Overdue Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Performance Scores Chart */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 className="section-title">Average AI Performance Score</h2>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)' }} />
                <Legend />
                <Line type="monotone" dataKey="averageScore" stroke="var(--primary)" strokeWidth={3} name="Avg. Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
