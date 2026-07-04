import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, CreditCard, HelpCircle, TrendingUp, BookOpen, Activity, UserPlus } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import {
  collection, query, where, limit, getDocs,
  getCountFromServer, getAggregateFromServer, sum, Timestamp,
} from 'firebase/firestore';
import { subDays, subMonths, startOfDay, startOfMonth, format } from 'date-fns';
import { db } from '../lib/firebase';
import { StatCard } from '../components/shared/StatCard';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';

const TOOLTIP_STYLE = {
  backgroundColor: '#1C2347',
  border: '1px solid #2D3748',
  borderRadius: '8px',
  color: '#E2E8F0',
  fontSize: '12px',
};

// The app writes payment_requests.submittedAt as epoch-millis numbers while
// admin-side writes use serverTimestamp() — calling .toDate() on a number
// throws, so every read of this field has to go through this guard.
// (Mirrors the identical helper in SubscriptionsPage.tsx.)
const asDate = (v: unknown): Date | undefined => {
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);
  if (v && typeof (v as { toDate?: () => Date }).toDate === 'function') {
    return (v as { toDate: () => Date }).toDate();
  }
  return undefined;
};

interface RecentPayment {
  id: string;
  studentPhone: string | null;
  userId: string;
  planId: string;
  billingCycle?: string;
  amount: number;
  status: string;
  submittedAt: Date;
}

interface DashboardData {
  totalStudents: number;
  premiumStudents: number;
  pendingPayments: number;
  totalQuestions: number;
  newStudentsThisWeek: number;
  totalRevenue: number;
  activeToday: number;
  signupsTrend: { day: string; signups: number }[];
  quizTypeBreakdown: { quizType: string; attempts: number }[];
  revenueTrend: { month: string; revenue: number }[];
  recentPayments: RecentPayment[];
}

async function fetchDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = subDays(now, 14);
  const startOfTodayMs = startOfDay(now).getTime();

  const usersCol = collection(db, 'users');
  const paymentsCol = collection(db, 'payment_requests');
  const questionsCol = collection(db, 'questions');
  const attemptsCol = collection(db, 'quiz_attempts');

  const [
    totalStudentsSnap,
    premiumSnap,
    pendingSnap,
    questionsSnap,
    newStudentsSnap,
    revenueAggSnap,
    todayAttemptsSnap,
    signupsSnap,
    verifiedPaymentsSnap,
    recentPaymentsSnap,
  ] = await Promise.all([
    getCountFromServer(usersCol),
    getCountFromServer(query(usersCol, where('subscriptionStatus', 'in', ['active', 'premium', 'family']))),
    getCountFromServer(query(paymentsCol, where('status', '==', 'pending'))),
    getCountFromServer(questionsCol),
    getCountFromServer(query(usersCol, where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)))),
    getAggregateFromServer(query(paymentsCol, where('status', '==', 'verified')), { total: sum('amount') }),
    getDocs(query(attemptsCol, where('startedAt', '>=', startOfTodayMs))),
    getDocs(query(usersCol, where('createdAt', '>=', Timestamp.fromDate(fourteenDaysAgo)))),
    getDocs(query(paymentsCol, where('status', '==', 'verified'))),
    getDocs(query(paymentsCol, limit(20))),
  ]);

  // Active today + quiz-type engagement both come from the same day's
  // attempts, so we only pay for one collection read.
  const activeUserIds = new Set<string>();
  const quizTypeCounts = new Map<string, number>();
  todayAttemptsSnap.docs.forEach((d) => {
    const data = d.data();
    if (typeof data.userId === 'string') activeUserIds.add(data.userId);
    const quizType = typeof data.quizType === 'string' && data.quizType ? data.quizType : 'unknown';
    quizTypeCounts.set(quizType, (quizTypeCounts.get(quizType) ?? 0) + 1);
  });
  const quizTypeBreakdown = Array.from(quizTypeCounts.entries())
    .map(([quizType, attempts]) => ({ quizType, attempts }))
    .sort((a, b) => b.attempts - a.attempts);

  // Bucket last 14 days of signups by day for the trend chart.
  const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');
  const dayBuckets = new Map<string, number>();
  for (let i = 13; i >= 0; i -= 1) {
    dayBuckets.set(dayKey(subDays(startOfDay(now), i)), 0);
  }
  signupsSnap.docs.forEach((d) => {
    const createdAt = asDate(d.data().createdAt);
    if (!createdAt) return;
    const key = dayKey(createdAt);
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
  });
  const signupsTrend = Array.from(dayBuckets.entries()).map(([key, signups]) => ({
    day: format(new Date(`${key}T00:00:00`), 'MMM d'),
    signups,
  }));

  // Bucket verified payments by month (last 6 months) for the revenue trend.
  const monthKey = (d: Date) => format(d, 'yyyy-MM');
  const monthBuckets = new Map<string, number>();
  for (let i = 5; i >= 0; i -= 1) {
    monthBuckets.set(monthKey(subMonths(startOfMonth(now), i)), 0);
  }
  verifiedPaymentsSnap.docs.forEach((d) => {
    const data = d.data();
    const submittedAt = asDate(data.submittedAt);
    if (!submittedAt) return;
    const key = monthKey(submittedAt);
    if (monthBuckets.has(key)) {
      monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + (Number(data.amount) || 0));
    }
  });
  const revenueTrend = Array.from(monthBuckets.entries()).map(([key, revenue]) => ({
    month: format(new Date(`${key}-01T00:00:00`), 'MMM'),
    revenue,
  }));

  const recentPayments = recentPaymentsSnap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        studentPhone: data.studentPhone ?? null,
        userId: data.userId ?? '',
        planId: data.planId ?? 'standard',
        billingCycle: data.billingCycle,
        amount: Number(data.amount) || 0,
        status: data.status ?? 'pending',
        submittedAt: asDate(data.submittedAt) ?? new Date(0),
      } as RecentPayment;
    })
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
    .slice(0, 5);

  return {
    totalStudents: totalStudentsSnap.data().count,
    premiumStudents: premiumSnap.data().count,
    pendingPayments: pendingSnap.data().count,
    totalQuestions: questionsSnap.data().count,
    newStudentsThisWeek: newStudentsSnap.data().count,
    totalRevenue: revenueAggSnap.data().total,
    activeToday: activeUserIds.size,
    signupsTrend,
    quizTypeBreakdown,
    revenueTrend,
    recentPayments,
  };
}

export function DashboardPage() {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardData,
  });

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load dashboard',
        description: error instanceof Error ? error.message : 'Could not fetch live stats from Firestore.',
      });
    }
  }, [error, toast]);

  const stats = data;
  const premiumConversion = stats && stats.totalStudents > 0
    ? ((stats.premiumStudents / stats.totalStudents) * 100).toFixed(1)
    : '0.0';
  const activeShare = stats && stats.totalStudents > 0
    ? ((stats.activeToday / stats.totalStudents) * 100).toFixed(1)
    : '0.0';

  const fmt = (n?: number) => (isLoading || n === undefined ? '—' : n.toLocaleString());

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back — here's what's happening in Soma" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={fmt(stats?.totalStudents)}
            subtitle={stats ? `+${stats.newStudentsThisWeek.toLocaleString()} this week` : undefined}
            icon={<Users size={22} />}
          />
          <StatCard
            title="Active Today"
            value={fmt(stats?.activeToday)}
            subtitle={stats ? `${activeShare}% of total` : undefined}
            icon={<Activity size={22} />}
          />
          <StatCard
            title="Premium Students"
            value={fmt(stats?.premiumStudents)}
            subtitle={stats ? `${premiumConversion}% conversion` : undefined}
            icon={<CreditCard size={22} />}
          />
          <StatCard
            title="Pending Payments"
            value={fmt(stats?.pendingPayments)}
            subtitle="Requires review"
            icon={<TrendingUp size={22} />}
            iconClassName="bg-amber-500/10 text-amber-400"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard
            title="Total Questions"
            value={fmt(stats?.totalQuestions)}
            subtitle="Across all subjects"
            icon={<HelpCircle size={22} />}
          />
          <StatCard
            title="New Students This Week"
            value={fmt(stats?.newStudentsThisWeek)}
            subtitle="Last 7 days"
            icon={<UserPlus size={22} />}
          />
          <StatCard
            title="Total Revenue"
            value={isLoading || !stats ? '—' : `${stats.totalRevenue.toLocaleString()} TSH`}
            subtitle="All verified payments"
            icon={<BookOpen size={22} />}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardHeader><CardTitle className="text-base">New Signups (Last 14 Days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats?.signupsTrend ?? []}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7B6FF2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7B6FF2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="signups" stroke="#7B6FF2" fill="url(#colorUsers)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Quiz Attempts Today</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats?.quizTypeBreakdown ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                  <XAxis type="number" stroke="#6B7280" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="quizType" type="category" stroke="#6B7280" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="attempts" fill="#4ECDC4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <CardHeader><CardTitle className="text-base">Revenue Trend (Verified Payments, TSH)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats?.revenueTrend ?? []}>
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
              {isLoading && (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded bg-muted" />
                ))
              )}
              {!isLoading && (stats?.recentPayments.length ?? 0) === 0 && (
                <p className="text-sm text-muted-foreground">No payments found</p>
              )}
              {!isLoading && stats?.recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-foreground">{p.studentPhone ?? p.userId}</p>
                    <p className="text-xs text-muted-foreground">{p.planId} · {p.amount.toLocaleString()} TSH</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
