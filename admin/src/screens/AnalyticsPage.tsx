import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Users, TrendingUp, Activity, Target } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { StatCard } from '../components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const generateDailyData = (days: number) =>
  Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i - 1) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    dau: Math.floor(1200 + Math.random() * 1200),
  }));

const subjectPerformance = [
  { subject: 'Mathematics', avgScore: 72, attempts: 4820 },
  { subject: 'Physics', avgScore: 65, attempts: 3210 },
  { subject: 'Chemistry', avgScore: 70, attempts: 2890 },
  { subject: 'Biology', avgScore: 78, attempts: 3540 },
  { subject: 'English', avgScore: 82, attempts: 5100 },
  { subject: 'Kiswahili', avgScore: 85, attempts: 4200 },
  { subject: 'History', avgScore: 69, attempts: 1800 },
  { subject: 'Geography', avgScore: 74, attempts: 2100 },
];

const retentionData = [
  { cohort: 'Jan 2026', w1: 100, w2: 72, w3: 58, w4: 47 },
  { cohort: 'Feb 2026', w1: 100, w2: 75, w3: 61, w4: 52 },
  { cohort: 'Mar 2026', w1: 100, w2: 69, w3: 55, w4: 44 },
  { cohort: 'Apr 2026', w1: 100, w2: 78, w3: 64, w4: 55 },
  { cohort: 'May 2026', w1: 100, w2: 74, w3: 62, w4: 50 },
];

const TOOLTIP_STYLE = {
  backgroundColor: '#1C2347',
  border: '1px solid #2D3748',
  borderRadius: '8px',
  color: '#E2E8F0',
  fontSize: '12px',
};

function RetentionCell({ value }: { value: number }) {
  const opacity = value / 100;
  return (
    <td
      className="px-3 py-2 text-center text-sm font-medium"
      style={{
        backgroundColor: `rgba(123, 111, 242, ${opacity * 0.6})`,
        color: value > 50 ? '#E2E8F0' : '#9CA3AF',
      }}
    >
      {value}%
    </td>
  );
}

export function AnalyticsPage() {
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const data = generateDailyData(period);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="User engagement, retention, and learning performance" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Daily Active Users" value="2,104" icon={<Activity size={22} />} trend={{ value: 8, label: 'vs yesterday' }} />
          <StatCard title="Weekly Active Users" value="8,420" icon={<Users size={22} />} trend={{ value: 12, label: 'vs last week' }} />
          <StatCard title="Monthly Active Users" value="12,847" icon={<TrendingUp size={22} />} trend={{ value: 15, label: 'vs last month' }} />
          <StatCard title="Avg Session Length" value="18 min" icon={<Target size={22} />} trend={{ value: 3, label: 'vs last week' }} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Daily Active Users</CardTitle>
            <div className="flex gap-2">
              {([7, 30, 90] as const).map((d) => (
                <Button key={d} size="sm" variant={period === d ? 'default' : 'outline'} onClick={() => setPeriod(d)}>
                  {d}d
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B6FF2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7B6FF2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 11 }} interval={Math.floor(period / 7)} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Area type="monotone" dataKey="dau" name="DAU" stroke="#7B6FF2" fill="url(#dauGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Subject Avg Score (%)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                  <XAxis type="number" stroke="#6B7280" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <YAxis dataKey="subject" type="category" stroke="#6B7280" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="avgScore" name="Avg Score" fill="#4ECDC4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Retention Cohort Analysis</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Cohort</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Week 1</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Week 2</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Week 3</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Week 4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retentionData.map((row) => (
                      <tr key={row.cohort} className="border-b border-border/50">
                        <td className="px-3 py-2 text-xs font-medium">{row.cohort}</td>
                        <RetentionCell value={row.w1} />
                        <RetentionCell value={row.w2} />
                        <RetentionCell value={row.w3} />
                        <RetentionCell value={row.w4} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
