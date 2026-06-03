import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, updateDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { Search, Eye, Ban, CheckCircle, RefreshCw } from 'lucide-react';
import { db } from '../lib/firebase';
import { logAudit } from '../services/auditService';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import type { Student } from '../types';

type StudentAction = 'suspend' | 'activate' | 'reset';

export function StudentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterSub, setFilterSub] = useState('all');
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ student: Student; action: StudentAction } | null>(null);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(200));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
        lastActiveAt: d.data().lastActiveAt?.toDate(),
        subscriptionExpiry: d.data().subscriptionExpiry?.toDate(),
      } as Student));
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ student, action }: { student: Student; action: StudentAction }) => {
      const updates: Record<string, unknown> = {};
      if (action === 'suspend') updates.isSuspended = true;
      else if (action === 'activate') updates.isSuspended = false;
      else if (action === 'reset') { updates.totalXp = 0; updates.currentStreak = 0; }
      await updateDoc(doc(db, 'users', student.id), updates);
      await logAudit(action, 'students', student.id, updates);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setConfirmAction(null); },
  });

  const filtered = students.filter((s) => {
    const matchSearch = !search || s.phone?.includes(search) || s.displayName?.toLowerCase().includes(search.toLowerCase());
    const matchSub = filterSub === 'all' || s.subscriptionStatus === filterSub;
    return matchSearch && matchSub;
  });

  const columns: Column<Student>[] = [
    {
      key: 'name', header: 'Student', render: (r) => (
        <div>
          <p className="font-medium text-sm">{r.displayName || 'Unnamed'}</p>
          <p className="text-xs text-muted-foreground">{r.phone}</p>
        </div>
      ),
    },
    { key: 'sub', header: 'Subscription', render: (r) => <StatusBadge status={r.subscriptionStatus} /> },
    { key: 'xp', header: 'XP', render: (r) => <span className="font-medium text-amber-400">{r.totalXp?.toLocaleString() ?? 0}</span> },
    { key: 'streak', header: 'Streak', render: (r) => <span>{r.currentStreak ?? 0} days</span> },
    { key: 'joined', header: 'Joined', render: (r) => <span className="text-xs text-muted-foreground">{format(r.createdAt, 'MMM d, yyyy')}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.isSuspended ? 'suspended' : 'active'} /> },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setViewStudent(r); }}><Eye size={14} /></Button>
          {r.isSuspended
            ? <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setConfirmAction({ student: r, action: 'activate' }); }}><CheckCircle size={14} className="text-emerald-400" /></Button>
            : <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setConfirmAction({ student: r, action: 'suspend' }); }}><Ban size={14} className="text-destructive" /></Button>
          }
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setConfirmAction({ student: r, action: 'reset' }); }}><RefreshCw size={14} /></Button>
        </div>
      ),
    },
  ];

  const actionLabels: Record<StudentAction, string> = {
    suspend: 'Suspend Student',
    activate: 'Activate Student',
    reset: 'Reset Progress',
  };
  const actionDescriptions: Record<StudentAction, (s: Student) => string> = {
    suspend: (s) => `Suspend ${s.displayName}? They won't be able to log in.`,
    activate: (s) => `Reactivate ${s.displayName}?`,
    reset: (s) => `Reset XP and streak for ${s.displayName}? This cannot be undone.`,
  };

  return (
    <div>
      <PageHeader title="Students" subtitle={`${students.length} registered students`} />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 max-w-xs" />
          </div>
          <div className="flex gap-2">
            {['all', 'free', 'premium', 'family'].map((s) => (
              <Button key={s} size="sm" variant={filterSub === s ? 'default' : 'outline'} onClick={() => setFilterSub(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <DataTable columns={columns} data={filtered} isLoading={isLoading} emptyMessage="No students found" />
      </div>

      <Dialog open={!!viewStudent} onOpenChange={(v) => !v && setViewStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Student Details</DialogTitle></DialogHeader>
          {viewStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                  {viewStudent.displayName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="font-semibold text-lg">{viewStudent.displayName || 'Unnamed'}</p>
                  <p className="text-sm text-muted-foreground">{viewStudent.phone}</p>
                  <div className="mt-1 flex gap-2">
                    <StatusBadge status={viewStudent.subscriptionStatus} />
                    <StatusBadge status={viewStudent.isSuspended ? 'suspended' : 'active'} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 rounded-lg border border-border p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-400">{viewStudent.totalXp?.toLocaleString() ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{viewStudent.currentStreak ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{viewStudent.formId ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">Form</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">School</span><span>{viewStudent.schoolName || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span>{format(viewStudent.createdAt, 'MMM d, yyyy')}</span></div>
                {viewStudent.lastActiveAt && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Last Active</span><span>{format(viewStudent.lastActiveAt, 'MMM d, yyyy HH:mm')}</span></div>
                )}
                {viewStudent.subscriptionExpiry && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Sub Expiry</span><span>{format(viewStudent.subscriptionExpiry, 'MMM d, yyyy')}</span></div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(v) => !v && setConfirmAction(null)}
        title={confirmAction ? actionLabels[confirmAction.action] : ''}
        description={confirmAction ? actionDescriptions[confirmAction.action](confirmAction.student) : ''}
        confirmLabel={confirmAction?.action === 'suspend' ? 'Suspend' : confirmAction?.action === 'activate' ? 'Activate' : 'Reset'}
        variant={confirmAction?.action === 'reset' ? 'destructive' : 'default'}
        onConfirm={() => confirmAction && actionMutation.mutate(confirmAction)}
        isLoading={actionMutation.isPending}
      />
    </div>
  );
}
