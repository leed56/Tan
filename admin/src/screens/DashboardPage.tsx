import React from 'react';
import { Users, CreditCard, HelpCircle, TrendingUp, BookOpen, Activity } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { StatCard } from '../components/shared/StatCard';
import { PageHeader } from '../components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const dailyActiveData = [
  { day: 'Mon', users: 1240 }, { day: 'Tue', users: 1580 }, { day: 'Wed', users: 1320 },
  { day: 'Thu', users: 1750 }, { day: 'Fri', users: 2100 }, { day: 'Sat', users: 1890 },
  { day: 'Sun', users: 1640 },
];

const revenueData = [
  { month: 'Jan', revenue: 124000 }, { month: 'Feb', revenue: 198000 }, { month: 'Mar', revenue: 187000 },
  { month: 'Apr', revenue: 241000 }, { month: 'May', revenue: 289000 }, { month: 'Jun', revenue: 312000 },
];

const subjectEngagementData = [
  { subject: 'Math', packs: 420 }, { subject: 'Physics', packs: 380 }, { subject: 'Chemistry', packs: 290 },
  { subject: 'Biology', packs: 340 }, { subject: 'English', packs: 510 }, { subject: 'History', packs: 180 },
];

const recentPayments = [
  { id: '1', phone: '+255 712 345 678', plan: 'Single', amount: '5,000 TSH', status: 'pending' },
  { id: '2', phone: '+255 723 456 789', plan: 'Family', amount: '8,000 TSH', status: 'verified' },
  { id: '3', phone: '+255 734 567 890', plan: 'Single', amount: '5,000 TSH', status: 'pending' },
  { id: '4', phone: '+255 745 678 901', plan: 'Family', amount: '8,000 TSH', status: 'verified' },
];

const TOOLTIP_STYLE = {
  backgroundColor: '#1C2347',
  border: '1px solid #2D3748',
  borderRadius: '8px',
  color: '#E2E8F0',
  fontSize: '12px',
};

export function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back — here's what's happening in Soma" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Students" value="12,847" subtitle="+234 this week" icon={<Users size={22} />} trend={{ value: 12, label: 'vs last month' }} />
          <StatCard title="Active Today" value="2,104" subtitle="16.4% of total" icon={<Activity size={22} />} trend={{ value: 8, label: 'vs yesterday' }} />
          <StatCard title="Premium Users" value="3,291" subtitle="25.6% conversion" icon={<CreditCard size={22} />} trend={{ value: 5, label: 'vs last month' }} />
          <StatCard title="Pending Payments" value="47" subtitle="Requires review" icon={<TrendingUp size={22} />} iconClassName="bg-amber-500/10 text-amber-400" />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Questions" value="8,420" subtitle="Across all subjects" icon={<HelpCircle size={22} />} />
          <StatCard title="Monthly Revenue" value="312,000 TSH" subtitle="June 2026" icon={<CreditCard size={22} />} trend={{ value: 8, label: 'vs last month' }} />
          <StatCard title="Learning Packs" value="684" subtitle="Across 12 subjects" icon={<BookOpen size={22} />} />
          <StatCard title="AI Explanations" value="15,240" subtitle="Generated this month" icon={<Activity size={22} />} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardHeader><CardTitle className="text-base">Daily Active Users (This Week)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dailyActiveData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7B6FF2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7B6FF2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="users" stroke="#7B6FF2" fill="url(#colorUsers)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Subject Engagement</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={subjectEngagementData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                  <XAxis type="number" stroke="#6B7280" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="subject" type="category" stroke="#6B7280" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="packs" fill="#4ECDC4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardHeader><CardTitle className="text-base">Monthly Revenue (TSH)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${Number(v).toLocaleString()} TSH`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#F7C52E" strokeWidth={2} dot={{ fill: '#F7C52E', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Recent Payments</CardTitle></CardHeader>
            <CardContent className="space-y-3 pt-0">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-foreground">{p.phone}</p>
                    <p className="text-xs text-muted-foreground">{p.plan} · {p.amount}</p>
                  </div>
                  <Badge variant={p.status === 'verified' ? 'success' : 'warning'}>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
