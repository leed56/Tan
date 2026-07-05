import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  doc, getDoc, setDoc, collection, getDocs,
  addDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil } from 'lucide-react';
import { db } from '../lib/firebase';
import { logAudit } from '../services/auditService';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { RoleBadge } from '../components/shared/RoleBadge';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import type { AppSettings, AdminUser, AdminRole } from '../types';

const settingsSchema = z.object({
  maxDailyMcq: z.number().min(0),
  maxDailyFib: z.number().min(0),
  maxDailyTf: z.number().min(0),
  singlePlanPriceTzs: z.number().min(0),
  familyPlanPriceTzs: z.number().min(0),
  singlePlanDurationDays: z.number().min(1),
  familyPlanDurationDays: z.number().min(1),
  maxFamilyMembers: z.number().min(1),
  geminiApiEnabled: z.boolean(),
  maintenanceMode: z.boolean(),
});
type SettingsValues = z.infer<typeof settingsSchema>;

const adminSchema = z.object({
  // Firebase Auth UID of the target account — rules and login both key
  // admin_users by uid, so a random-id doc never grants access.
  uid: z.string().min(10),
  email: z.string().email(),
  displayName: z.string().min(1),
  role: z.enum(['super_admin', 'content_editor', 'viewer']),
});
type AdminValues = z.infer<typeof adminSchema>;

function AppSettingsTab() {
  const qc = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['app_settings'],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'app_settings', 'main'));
      return snap.data() as AppSettings | undefined;
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    values: settings ? {
      maxDailyMcq: settings.maxDailyMcq ?? 10,
      maxDailyFib: settings.maxDailyFib ?? 5,
      maxDailyTf: settings.maxDailyTf ?? 10,
      singlePlanPriceTzs: settings.singlePlanPriceTzs ?? 4999,
      familyPlanPriceTzs: settings.familyPlanPriceTzs ?? 7999,
      singlePlanDurationDays: settings.singlePlanDurationDays ?? 30,
      familyPlanDurationDays: settings.familyPlanDurationDays ?? 30,
      maxFamilyMembers: settings.maxFamilyMembers ?? 4,
      geminiApiEnabled: settings.geminiApiEnabled ?? true,
      maintenanceMode: settings.maintenanceMode ?? false,
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: async (data: SettingsValues) => {
      await setDoc(doc(db, 'app_settings', 'main'), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      await logAudit('update', 'app_settings', 'main', data as unknown as Record<string, unknown>);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app_settings'] }),
  });

  const geminiEnabled = watch('geminiApiEnabled');
  const maintenanceMode = watch('maintenanceMode');

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader><CardTitle className="text-base">Daily Limits (Free Users)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>MCQ per day</Label>
            <Input type="number" {...register('maxDailyMcq', { valueAsNumber: true })} />
            {errors.maxDailyMcq && <p className="text-xs text-destructive">{errors.maxDailyMcq.message}</p>}
          </div>
          <div className="space-y-2"><Label>FIB per day</Label><Input type="number" {...register('maxDailyFib', { valueAsNumber: true })} /></div>
          <div className="space-y-2"><Label>T/F per day</Label><Input type="number" {...register('maxDailyTf', { valueAsNumber: true })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Subscription Plans</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Standard Plan — Monthly (TSH)</Label><Input type="number" {...register('singlePlanPriceTzs', { valueAsNumber: true })} /></div>
          <div className="space-y-2"><Label>Family Plan — Monthly (TSH)</Label><Input type="number" {...register('familyPlanPriceTzs', { valueAsNumber: true })} /></div>
          <div className="space-y-2"><Label>Standard Plan Duration (days)</Label><Input type="number" {...register('singlePlanDurationDays', { valueAsNumber: true })} /></div>
          <div className="space-y-2"><Label>Family Plan Duration (days)</Label><Input type="number" {...register('familyPlanDurationDays', { valueAsNumber: true })} /></div>
          <div className="space-y-2"><Label>Max Family Profiles (1 primary + N)</Label><Input type="number" {...register('maxFamilyMembers', { valueAsNumber: true })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Feature Flags</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Gemini AI Explanations</p>
              <p className="text-xs text-muted-foreground">Enable/disable AI explanation generation</p>
            </div>
            <Switch checked={geminiEnabled ?? false} onCheckedChange={(v) => setValue('geminiApiEnabled', v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">Blocks all student access to the app</p>
            </div>
            <Switch checked={maintenanceMode ?? false} onCheckedChange={(v) => setValue('maintenanceMode', v)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Settings'}</Button>
        {mutation.isSuccess && <p className="text-sm text-emerald-400">Settings saved!</p>}
      </div>
    </form>
  );
}

function AdminUsersTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<AdminUser | null>(null);

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'admin_users'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() ?? new Date() } as AdminUser));
    },
  });

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<AdminValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: { role: 'viewer' },
  });

  const mutation = useMutation({
    mutationFn: async (data: AdminValues) => {
      if (editItem) {
        await updateDoc(doc(db, 'admin_users', editItem.id), { role: data.role, displayName: data.displayName, updatedAt: serverTimestamp() });
        await logAudit('update', 'admin_users', editItem.id, { role: data.role });
      } else {
        const { uid, ...rest } = data;
        await setDoc(doc(db, 'admin_users', uid), { ...rest, isActive: true, createdAt: serverTimestamp() });
        await logAudit('create', 'admin_users', uid, { email: data.email, role: data.role });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin_users'] }); setOpen(false); reset(); setEditItem(null); },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await updateDoc(doc(db, 'admin_users', id), { isActive: !isActive });
      await logAudit(isActive ? 'deactivate' : 'activate', 'admin_users', id, {});
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_users'] }),
  });

  const columns: Column<AdminUser>[] = [
    {
      key: 'name', header: 'Admin', render: (r) => (
        <div>
          <p className="font-medium text-sm">{r.displayName}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (r) => <RoleBadge role={r.role} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.isActive ? 'active' : 'suspended'} /> },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditItem(r); reset({ uid: r.id, email: r.email, displayName: r.displayName, role: r.role }); setOpen(true); }}>
            <Pencil size={14} />
          </Button>
          <Button
            size="sm"
            variant={r.isActive ? 'destructive' : 'secondary'}
            onClick={(e) => { e.stopPropagation(); toggleMutation.mutate({ id: r.id, isActive: r.isActive }); }}
          >
            {r.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { reset({ uid: '', email: '', displayName: '', role: 'viewer' }); setEditItem(null); setOpen(true); }}>
          <Plus size={16} className="mr-2" /> Add Admin
        </Button>
      </div>
      <DataTable columns={columns} data={admins} isLoading={isLoading} emptyMessage="No admin users" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? 'Edit Admin' : 'Add Admin User'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input {...register('displayName')} placeholder="John Doe" />
              {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...register('email')} placeholder="admin@somaai.tz" disabled={!!editItem} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            {!editItem && (
              <div className="space-y-2">
                <Label>Firebase Auth UID</Label>
                <Input {...register('uid')} placeholder="From Firebase Console → Authentication → Users" />
                <p className="text-xs text-muted-foreground">
                  The account must exist in Firebase Auth first; access is keyed to its UID.
                </p>
                {errors.uid && <p className="text-xs text-destructive">{errors.uid.message}</p>}
              </div>
            )}
            <div className="space-y-2">
              <Label>Role</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => field.onChange(v as AdminRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="content_editor">Content Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure app settings and admin access" />
      <div className="p-6">
        <Tabs defaultValue="app">
          <TabsList className="mb-6">
            <TabsTrigger value="app">App Config</TabsTrigger>
            <TabsTrigger value="admins">Admin Users</TabsTrigger>
          </TabsList>
          <TabsContent value="app"><AppSettingsTab /></TabsContent>
          <TabsContent value="admins"><AdminUsersTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
