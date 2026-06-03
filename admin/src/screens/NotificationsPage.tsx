import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Bell, Send } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../lib/firebase';
import { logAudit } from '../services/auditService';
import { useAuthStore } from '../store/authStore';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import type { Notification } from '../types';

const notifSchema = z.object({
  title: z.string().min(1, 'Title required'),
  body: z.string().min(1, 'Body required').max(200, 'Max 200 chars'),
  targetType: z.enum(['all', 'premium', 'free', 'specific']),
});

type NotifValues = z.infer<typeof notifSchema>;

const TARGET_LABELS: Record<string, string> = {
  all: 'All Users', premium: 'Premium', free: 'Free Users', specific: 'Specific',
};

export function NotificationsPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const q = query(collection(db, 'notifications_sent'), orderBy('sentAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data(), sentAt: d.data().sentAt?.toDate() ?? new Date() } as Notification));
    },
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<NotifValues>({
    resolver: zodResolver(notifSchema),
    defaultValues: { targetType: 'all' },
  });

  const sendMutation = useMutation({
    mutationFn: async (data: NotifValues) => {
      const docRef = await addDoc(collection(db, 'notifications_sent'), {
        ...data,
        sentAt: serverTimestamp(),
        sentBy: user?.email,
        deliveredCount: 0,
      });
      await logAudit('send_notification', 'notifications_sent', docRef.id, { title: data.title, target: data.targetType });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); reset(); },
  });

  const columns: Column<Notification>[] = [
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium">{r.title}</span> },
    { key: 'body', header: 'Message', render: (r) => <p className="text-xs text-muted-foreground line-clamp-2 max-w-xs">{r.body}</p> },
    { key: 'target', header: 'Target', render: (r) => <Badge variant="secondary">{TARGET_LABELS[r.targetType] ?? r.targetType}</Badge> },
    { key: 'delivered', header: 'Delivered', render: (r) => <span className="font-medium">{r.deliveredCount?.toLocaleString() ?? 0}</span> },
    { key: 'sent', header: 'Sent', render: (r) => <span className="text-xs text-muted-foreground">{format(r.sentAt, 'MMM d, HH:mm')}</span> },
    { key: 'by', header: 'By', render: (r) => <span className="text-xs text-muted-foreground">{r.sentBy}</span> },
  ];

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Send push notifications to students" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Sent This Month" value={notifications.length} icon={<Send size={22} />} />
          <StatCard title="Avg Delivery Rate" value="94%" icon={<Bell size={22} />} iconClassName="bg-emerald-500/10 text-emerald-400" />
          <StatCard title="Total Delivered" value={notifications.reduce((s, n) => s + (n.deliveredCount ?? 0), 0).toLocaleString()} icon={<Bell size={22} />} />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Send New Notification</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((v) => sendMutation.mutate(v))} className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Controller control={control} name="targetType" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="premium">Premium Users</SelectItem>
                      <SelectItem value="free">Free Users</SelectItem>
                      <SelectItem value="specific">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input {...register('title')} placeholder="New Study Pack Available!" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Message Body</Label>
                <Textarea {...register('body')} placeholder="We've just added 50 new NECTA practice questions..." rows={3} />
                {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
              </div>
              <Button type="submit" disabled={sendMutation.isPending}>
                <Send size={16} className="mr-2" />
                {sendMutation.isPending ? 'Sending...' : 'Send Notification'}
              </Button>
              {sendMutation.isSuccess && <p className="text-sm text-emerald-400">Notification queued successfully!</p>}
            </form>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-4 text-base font-semibold">Notification History</h2>
          <DataTable columns={columns} data={notifications} isLoading={isLoading} emptyMessage="No notifications sent yet" />
        </div>
      </div>
    </div>
  );
}
