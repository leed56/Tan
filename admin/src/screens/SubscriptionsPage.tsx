import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, updateDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { db } from '../lib/firebase';
import { logAudit } from '../services/auditService';
import { useAuthStore } from '../store/authStore';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { StatCard } from '../components/shared/StatCard';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CreditCard } from 'lucide-react';
import type { PaymentRequest } from '../types';

type PaymentAction = 'verified' | 'rejected';

export function SubscriptionsPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [confirmAction, setConfirmAction] = useState<{ payment: PaymentRequest; action: PaymentAction } | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const q = query(collection(db, 'payment_requests'), orderBy('submittedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        submittedAt: d.data().submittedAt?.toDate() ?? new Date(),
        verifiedAt: d.data().verifiedAt?.toDate(),
      } as PaymentRequest));
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ payment, action }: { payment: PaymentRequest; action: PaymentAction }) => {
      await updateDoc(doc(db, 'payment_requests', payment.id), {
        status: action,
        verifiedAt: serverTimestamp(),
        verifiedBy: user?.email,
      });
      if (action === 'verified') {
        // The client listens to users/{uid} in real time, so this write is
        // what makes activation reflect instantly in the app.
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + (payment.billingCycle === 'yearly' ? 365 : 30));
        await updateDoc(doc(db, 'users', payment.userId), {
          subscriptionStatus: 'active',
          subscriptionPlan: payment.planId,
          billingCycle: payment.billingCycle,
          subscriptionExpiry: expiry,
        });
      }
      await logAudit(
        action === 'verified' ? 'verify_payment' : 'reject_payment',
        'payment_requests',
        payment.id,
        { action, amount: payment.amount }
      );
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); setConfirmAction(null); },
  });

  const pending = payments.filter((p) => p.status === 'pending');
  const verified = payments.filter((p) => p.status === 'verified');
  const totalRevenue = verified.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const filtered = payments.filter((p) => filterStatus === 'all' || p.status === filterStatus);

  const columns: Column<PaymentRequest>[] = [
    { key: 'phone', header: 'Student', render: (r) => <span className="font-medium">{r.studentPhone ?? r.userId}</span> },
    {
      key: 'plan', header: 'Plan', render: (r) => (
        <Badge variant={r.planId === 'family' ? 'info' : 'secondary'}>
          {r.planId} · {r.billingCycle === 'yearly' ? 'yr' : 'mo'}
        </Badge>
      ),
    },
    { key: 'amount', header: 'Amount', render: (r) => <span className="font-medium text-amber-400">{r.amount?.toLocaleString()} TSH</span> },
    { key: 'method', header: 'Method', render: (r) => <span className="text-sm capitalize">{r.provider?.replace('_', ' ')}</span> },
    { key: 'ref', header: 'Ref', render: (r) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{r.transactionRef ?? '—'}</code> },
    { key: 'submitted', header: 'Submitted', render: (r) => <span className="text-xs text-muted-foreground">{format(r.submittedAt, 'MMM d, HH:mm')}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', header: '', render: (r) => r.status === 'pending' ? (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setConfirmAction({ payment: r, action: 'verified' }); }}>
            <CheckCircle size={14} className="text-emerald-400" />
          </Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setConfirmAction({ payment: r, action: 'rejected' }); }}>
            <XCircle size={14} className="text-destructive" />
          </Button>
        </div>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Subscriptions & Payments" subtitle="Verify payment requests and manage subscriptions" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Pending Payments" value={pending.length} subtitle="Awaiting verification" icon={<Clock size={22} />} iconClassName="bg-amber-500/10 text-amber-400" />
          <StatCard title="Verified This Month" value={verified.length} subtitle="Payments activated" icon={<CheckCircle size={22} />} iconClassName="bg-emerald-500/10 text-emerald-400" />
          <StatCard title="Total Revenue" value={`${totalRevenue.toLocaleString()} TSH`} subtitle="All time" icon={<TrendingUp size={22} />} />
        </div>

        <div className="flex gap-2">
          {['all', 'pending', 'verified', 'rejected'].map((s) => (
            <Button key={s} size="sm" variant={filterStatus === s ? 'default' : 'outline'} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        <DataTable columns={columns} data={filtered} isLoading={isLoading} emptyMessage="No payments found" />
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(v) => !v && setConfirmAction(null)}
        title={confirmAction?.action === 'verified' ? 'Verify Payment' : 'Reject Payment'}
        description={
          confirmAction?.action === 'verified'
            ? `Verify payment of ${confirmAction?.payment.amount?.toLocaleString()} TSH from ${confirmAction?.payment.studentPhone ?? confirmAction?.payment.userId}? This activates their ${confirmAction?.payment.planId} subscription instantly.`
            : `Reject payment from ${confirmAction?.payment.studentPhone ?? confirmAction?.payment.userId}?`
        }
        confirmLabel={confirmAction?.action === 'verified' ? 'Verify & Activate' : 'Reject'}
        variant={confirmAction?.action === 'rejected' ? 'destructive' : 'default'}
        onConfirm={() => confirmAction && actionMutation.mutate(confirmAction)}
        isLoading={actionMutation.isPending}
      />
    </div>
  );
}
