import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import {
  ComposedChart, Area, Bar, BarChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Users, TrendingUp, Activity, Target } from 'lucide-react';
import { db } from '../lib/firebase';
import { PageHeader } from '../components/shared/PageHeader';
import { StatCard } from '../components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';

const DAY_MS = 86_400_000;
// Firestore safety cap on date-bounded scans below — the date filter should keep
// these well under this in practice, this just guards against a pathological range.
const SCAN_LIMIT = 20_000;

const TOOLTIP_STYLE = {
  backgroundColor: '#1C2347',
  border: '1px solid #2D3748',
  borderRadius: '8px',
  color: '#E2E8F0',
  fontSize: '12px',
};

interface QuizAttemptDoc {
  userId: string;
  subjectId?: string;
  startedAt: number;
  completedAt: number | null;
  scorePercent: number;
  totalQuestions: number;
  durationSeconds: number;
}

interface DailyBucket {
  date: string;
  attempts: number;
  avgScore: number;
  completionRate: number;
}

interface DailyActivity {
  daily: DailyBucket[];
  totalAttempts: number;
  completedAttempts: number;
  overallCompletionRate: number;
  avgQuestionsPerCompletedAttempt: number;
}

interface ActiveUsersSummary {
  dau: number;
  dauTrend: number;
  wau: number;
  wauTrend: number;
  mau: number;
  avgDurationMin: number;
}

interface SubjectPerformanceRow {
  subject: string;
  avgScore: number;
  attempts: number;
  color: string;
}

function pctChange(curr: number, prev: number): number {
  if (prev <= 0) return 0;
  return Math.round(((curr - prev) / prev) * 100);
}

// Buckets one entry per calendar day over the window, pre-seeded so days with
// zero activity still render instead of being skipped.
function buildDayBuckets(days: number) {
  const map = new Map<string, { label: string; attempts: number; completed: number; scoreSum: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - i - 1) * DAY_MS);
    const key = format(d, 'yyyy-MM-dd');
    map.set(key, { label: format(d, 'MMM d'), attempts: 0, completed: 0, scoreSum: 0 });
  }
  return map;
}

async function fetchDailyActivity(period: number): Promise<DailyActivity> {
  const cutoff = Date.now() - period * DAY_MS;
  const q = query(
    collection(db, 'quiz_attempts'),
    where('startedAt', '>=', cutoff),
    orderBy('startedAt', 'asc'),
    limit(SCAN_LIMIT)
  );
  const snap = await getDocs(q);
  const buckets = buildDayBuckets(period);

  let totalAttempts = 0;
  let completedAttempts = 0;
  let questionsSum = 0;

  snap.forEach((doc) => {
    const a = doc.data() as QuizAttemptDoc;
    totalAttempts += 1;
    const key = format(new Date(a.startedAt), 'yyyy-MM-dd');
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.attempts += 1;
      if (a.completedAt != null) {
        bucket.completed += 1;
        bucket.scoreSum += a.scorePercent ?? 0;
      }
    }
    if (a.completedAt != null) {
      completedAttempts += 1;
      questionsSum += a.totalQuestions ?? 0;
    }
  });

  const daily: DailyBucket[] = Array.from(buckets.values()).map((b) => ({
    date: b.label,
    attempts: b.attempts,
    avgScore: b.completed > 0 ? Math.round(b.scoreSum / b.completed) : 0,
    completionRate: b.attempts > 0 ? Math.round((b.completed / b.attempts) * 100) : 0,
  }));

  return {
    daily,
    totalAttempts,
    completedAttempts,
    overallCompletionRate: totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0,
    avgQuestionsPerCompletedAttempt:
      completedAttempts > 0 ? Math.round((questionsSum / completedAttempts) * 10) / 10 : 0,
  };
}

// Fixed 30-day window, independent of the chart's period toggle, so the DAU /
// WAU / MAU stat cards don't jump around when the user switches the chart range.
async function fetchActiveUsersSummary(): Promise<ActiveUsersSummary> {
  const cutoff = Date.now() - 30 * DAY_MS;
  const q = query(
    collection(db, 'quiz_attempts'),
    where('startedAt', '>=', cutoff),
    orderBy('startedAt', 'asc'),
    limit(SCAN_LIMIT)
  );
  const snap = await getDocs(q);

  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();
  const yesterdayStartMs = todayStartMs - DAY_MS;
  const sevenDaysAgo = now - 7 * DAY_MS;
  const fourteenDaysAgo = now - 14 * DAY_MS;

  const todayUsers = new Set<string>();
  const yesterdayUsers = new Set<string>();
  const last7Users = new Set<string>();
  const prev7Users = new Set<string>();
  const last30Users = new Set<string>();
  let durationSum = 0;
  let durationCount = 0;

  snap.forEach((doc) => {
    const a = doc.data() as QuizAttemptDoc;
    last30Users.add(a.userId);
    if (a.startedAt >= todayStartMs) todayUsers.add(a.userId);
    else if (a.startedAt >= yesterdayStartMs) yesterdayUsers.add(a.userId);

    if (a.startedAt >= sevenDaysAgo) last7Users.add(a.userId);
    else if (a.startedAt >= fourteenDaysAgo) prev7Users.add(a.userId);

    if (a.completedAt != null && typeof a.durationSeconds === 'number') {
      durationSum += a.durationSeconds;
      durationCount += 1;
    }
  });

  return {
    dau: todayUsers.size,
    dauTrend: pctChange(todayUsers.size, yesterdayUsers.size),
    wau: last7Users.size,
    wauTrend: pctChange(last7Users.size, prev7Users.size),
    mau: last30Users.size,
    avgDurationMin: durationCount > 0 ? Math.round((durationSum / durationCount / 60) * 10) / 10 : 0,
  };
}

// Recent-sample view (last 750 completed attempts), not an all-time aggregation —
// keeps this cheap without a server-side aggregation pipeline.
async function fetchSubjectPerformance(): Promise<SubjectPerformanceRow[]> {
  const attemptsQ = query(collection(db, 'quiz_attempts'), orderBy('completedAt', 'desc'), limit(750));
  const [attemptsSnap, subjectsSnap] = await Promise.all([
    getDocs(attemptsQ),
    getDocs(collection(db, 'subjects')),
  ]);

  const subjectMap = new Map<string, { name: string; color: string }>();
  subjectsSnap.forEach((doc) => {
    const s = doc.data() as { name: string; color: string };
    subjectMap.set(doc.id, { name: s.name, color: s.color });
  });

  const bySubject = new Map<string, { scoreSum: number; count: number }>();
  attemptsSnap.forEach((doc) => {
    const a = doc.data() as QuizAttemptDoc;
    // orderBy('completedAt','desc') sorts nulls last, so this should rarely
    // trigger, but skip defensively rather than count unfinished attempts.
    if (a.completedAt == null || !a.subjectId) return;
    const entry = bySubject.get(a.subjectId) ?? { scoreSum: 0, count: 0 };
    entry.scoreSum += a.scorePercent ?? 0;
    entry.count += 1;
    bySubject.set(a.subjectId, entry);
  });

  return Array.from(bySubject.entries())
    .map(([subjectId, { scoreSum, count }]) => ({
      subject: subjectMap.get(subjectId)?.name ?? subjectId,
      avgScore: Math.round(scoreSum / count),
      attempts: count,
      color: subjectMap.get(subjectId)?.color ?? '#4ECDC4',
    }))
    .sort((a, b) => b.attempts - a.attempts);
}

export function AnalyticsPage() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<7 | 30 | 90>(30);

  const dailyQuery = useQuery({
    queryKey: ['analytics-daily-activity', period],
    queryFn: () => fetchDailyActivity(period),
  });

  const activeUsersQuery = useQuery({
    queryKey: ['analytics-active-users'],
    queryFn: fetchActiveUsersSummary,
  });

  const subjectQuery = useQuery({
    queryKey: ['analytics-subject-performance'],
    queryFn: fetchSubjectPerformance,
  });

  useEffect(() => {
    const err = dailyQuery.error ?? activeUsersQuery.error ?? subjectQuery.error;
    if (err) {
      toast({ variant: 'destructive', title: 'Failed to load analytics', description: (err as Error).message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyQuery.error, activeUsersQuery.error, subjectQuery.error]);

  const daily = dailyQuery.data?.daily ?? [];
  const activeUsers = activeUsersQuery.data;
  const subjectPerformance = subjectQuery.data ?? [];

  return (
    <div>
      <PageHeader title="Analytics" subtitle="User engagement, retention, and learning performance" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Daily Active Users"
            value={activeUsersQuery.isLoading ? '...' : (activeUsers?.dau ?? 0).toLocaleString()}
            icon={<Activity size={22} />}
            trend={activeUsersQuery.isLoading ? undefined : { value: activeUsers?.dauTrend ?? 0, label: 'vs yesterday' }}
          />
          <StatCard
            title="Weekly Active Users"
            value={activeUsersQuery.isLoading ? '...' : (activeUsers?.wau ?? 0).toLocaleString()}
            icon={<Users size={22} />}
            trend={activeUsersQuery.isLoading ? undefined : { value: activeUsers?.wauTrend ?? 0, label: 'vs prior 7 days' }}
          />
          <StatCard
            title="Monthly Active Users"
            value={activeUsersQuery.isLoading ? '...' : (activeUsers?.mau ?? 0).toLocaleString()}
            subtitle="Distinct users, last 30 days"
            icon={<TrendingUp size={22} />}
          />
          <StatCard
            title="Avg Quiz Duration"
            value={activeUsersQuery.isLoading ? '...' : `${activeUsers?.avgDurationMin ?? 0} min`}
            subtitle="Completed attempts, last 30 days"
            icon={<Target size={22} />}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Daily Activity</CardTitle>
            <div className="flex gap-2">
              {([7, 30, 90] as const).map((d) => (
                <Button key={d} size="sm" variant={period === d ? 'default' : 'outline'} onClick={() => setPeriod(d)}>
                  {d}d
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {dailyQuery.isLoading ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={daily}>
                  <defs>
                    <linearGradient id="attemptsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7B6FF2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7B6FF2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 11 }} interval={Math.floor(period / 7)} />
                  <YAxis yAxisId="attempts" stroke="#6B7280" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="score" orientation="right" stroke="#6B7280" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Area yAxisId="attempts" type="monotone" dataKey="attempts" name="Attempts" stroke="#7B6FF2" fill="url(#attemptsGrad)" strokeWidth={2} />
                  <Line yAxisId="score" type="monotone" dataKey="avgScore" name="Avg Score %" stroke="#4ECDC4" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Subject Avg Score (%)</CardTitle></CardHeader>
            <CardContent>
              {subjectQuery.isLoading ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Loading...</div>
              ) : subjectPerformance.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">No completed attempts yet</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                      <XAxis type="number" stroke="#6B7280" tick={{ fontSize: 11 }} domain={[0, 100]} />
                      <YAxis dataKey="subject" type="category" stroke="#6B7280" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        formatter={(value, _name, item) => [`${value}%`, `Avg Score (${(item?.payload as SubjectPerformanceRow)?.attempts ?? 0} attempts)`]}
                      />
                      <Bar dataKey="avgScore" name="Avg Score" fill="#4ECDC4" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="mt-2 text-xs text-muted-foreground">Based on the most recent {subjectPerformance.reduce((s, r) => s + r.attempts, 0).toLocaleString()} completed attempts, not all-time data.</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Quiz Completion Rate by Day</CardTitle></CardHeader>
            <CardContent>
              {dailyQuery.isLoading ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={daily}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 11 }} interval={Math.floor(period / 7)} />
                      <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} domain={[0, 100]} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value}%`, 'Completion Rate']} />
                      <Bar dataKey="completionRate" name="Completion Rate" fill="#F7C52E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                    <span>Overall completion rate: <span className="font-medium text-foreground">{dailyQuery.data?.overallCompletionRate ?? 0}%</span></span>
                    <span>Avg questions/completed attempt: <span className="font-medium text-foreground">{dailyQuery.data?.avgQuestionsPerCompletedAttempt ?? 0}</span></span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
