import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, where,
} from 'firebase/firestore';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../lib/firebase';
import { logAudit } from '../services/auditService';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { DifficultyBadge } from '../components/shared/DifficultyBadge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { useToast } from '../components/ui/use-toast';
import type { Form as CForm, Subject } from '../types';

// --- Forms Tab ---
const formSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  displayOrder: z.number(),
});
type FormValues = z.infer<typeof formSchema>;

function FormsTab() {
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<CForm | null>(null);
  const [deleteItem, setDeleteItem] = useState<CForm | null>(null);
  const [open, setOpen] = useState(false);

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'forms'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CForm));
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Forms are sorted by `order` in the app; keep it in sync with displayOrder.
      const appFields = { order: data.displayOrder, isActive: true };
      if (editItem) {
        await updateDoc(doc(db, 'forms', editItem.id), { ...data, ...appFields, updatedAt: serverTimestamp() });
        await logAudit('update', 'forms', editItem.id, data as unknown as Record<string, unknown>);
      } else {
        const ref = await addDoc(collection(db, 'forms'), { ...data, ...appFields, createdAt: serverTimestamp() });
        await logAudit('create', 'forms', ref.id, data as unknown as Record<string, unknown>);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forms'] });
      setOpen(false);
      reset();
      setEditItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'forms', id));
      await logAudit('delete', 'forms', id, {});
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['forms'] }); setDeleteItem(null); },
  });

  const columns: Column<CForm>[] = [
    { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'code', header: 'Code', render: (r) => <Badge variant="secondary">{r.code}</Badge> },
    { key: 'order', header: 'Order', render: (r) => r.displayOrder },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditItem(r); reset(r as FormValues); setOpen(true); }}><Pencil size={14} /></Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteItem(r); }}><Trash2 size={14} className="text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { reset({ name: '', code: '', displayOrder: 1 }); setEditItem(null); setOpen(true); }}>
          <Plus size={16} className="mr-2" /> Add Form
        </Button>
      </div>
      <DataTable columns={columns} data={forms} isLoading={isLoading} emptyMessage="No forms yet" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? 'Edit Form' : 'Add Form'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register('name')} placeholder="Form 1" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input {...register('code')} placeholder="F1" />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input type="number" {...register('displayOrder', { valueAsNumber: true })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)}
        title="Delete Form" description={`Delete "${deleteItem?.name}"? This may break subjects.`}
        confirmLabel="Delete" variant="destructive"
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

// --- Subjects Tab ---
const subjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  formId: z.string().min(1),
  color: z.string().min(1),
  icon: z.string().min(1),
  isPremium: z.boolean(),
  displayOrder: z.number(),
});
type SubjectValues = z.infer<typeof subjectSchema>;

function SubjectsTab() {
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<Subject | null>(null);
  const [deleteItem, setDeleteItem] = useState<Subject | null>(null);
  const [open, setOpen] = useState(false);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'subjects'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subject));
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubjectValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { isPremium: false },
  });

  const mutation = useMutation({
    mutationFn: async (data: SubjectValues) => {
      // The app queries subjects with isActive == true and sorts by `order` —
      // docs missing either field are silently invisible to students.
      const appFields = { order: data.displayOrder, isActive: true };
      if (editItem) {
        await updateDoc(doc(db, 'subjects', editItem.id), { ...data, ...appFields, updatedAt: serverTimestamp() });
        await logAudit('update', 'subjects', editItem.id, data as unknown as Record<string, unknown>);
      } else {
        const ref = await addDoc(collection(db, 'subjects'), { ...data, ...appFields, description: '', createdAt: serverTimestamp() });
        await logAudit('create', 'subjects', ref.id, data as unknown as Record<string, unknown>);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); setOpen(false); reset(); setEditItem(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'subjects', id));
      await logAudit('delete', 'subjects', id, {});
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); setDeleteItem(null); },
  });

  const columns: Column<Subject>[] = [
    { key: 'name', header: 'Subject', render: (r) => <div className="flex items-center gap-2"><span className="text-lg">{r.icon}</span><span className="font-medium">{r.name}</span></div> },
    { key: 'code', header: 'Code', render: (r) => <Badge variant="secondary">{r.code}</Badge> },
    {
      key: 'color', header: 'Color', render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: r.color }} />
          <span className="text-xs text-muted-foreground">{r.color}</span>
        </div>
      ),
    },
    { key: 'premium', header: 'Access', render: (r) => <Badge variant={r.isPremium ? 'default' : 'secondary'}>{r.isPremium ? 'Premium' : 'Free'}</Badge> },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditItem(r); reset(r as SubjectValues); setOpen(true); }}><Pencil size={14} /></Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteItem(r); }}><Trash2 size={14} className="text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { reset({ name: '', code: '', formId: '', color: '#7B6FF2', icon: '📚', isPremium: false, displayOrder: 1 }); setEditItem(null); setOpen(true); }}>
          <Plus size={16} className="mr-2" /> Add Subject
        </Button>
      </div>
      <DataTable columns={columns} data={subjects} isLoading={isLoading} emptyMessage="No subjects yet" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? 'Edit Subject' : 'Add Subject'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Name</Label><Input {...register('name')} placeholder="Mathematics" /></div>
              <div className="space-y-2"><Label>Code</Label><Input {...register('code')} placeholder="MATH" /></div>
              <div className="space-y-2"><Label>Form ID</Label><Input {...register('formId')} placeholder="form_1" /></div>
              <div className="space-y-2"><Label>Color (hex)</Label><Input {...register('color')} placeholder="#7B6FF2" /></div>
              <div className="space-y-2"><Label>Icon (emoji)</Label><Input {...register('icon')} placeholder="📐" /></div>
              <div className="space-y-2"><Label>Display Order</Label><Input type="number" {...register('displayOrder', { valueAsNumber: true })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isPremium" {...register('isPremium')} className="h-4 w-4 rounded border-border" />
              <Label htmlFor="isPremium">Premium only</Label>
            </div>
            {Object.values(errors).some(Boolean) && <p className="text-xs text-destructive">Please fill all required fields</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)} title="Delete Subject" description={`Delete "${deleteItem?.name}"?`} confirmLabel="Delete" variant="destructive" onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)} isLoading={deleteMutation.isPending} />
    </div>
  );
}

// --- Topics Tab ---
// Real Firestore shape written by scripts/seed-content.mjs — note the field is
// `order`, not the `displayOrder` used by the Topic type in ../types/index.ts.
interface TopicDoc {
  id: string;
  formId: string;
  subjectId: string;
  name: string;
  description?: string;
  order: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  isActive: boolean;
}

// Form field keeps the `displayOrder` name for consistency with Forms/Subjects
// above; it's translated to the real `order` field only when writing.
const topicSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  displayOrder: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  estimatedMinutes: z.number().min(1),
  isActive: z.boolean(),
});
type TopicValues = z.infer<typeof topicSchema>;

function TopicsTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [subjectId, setSubjectId] = useState('');
  const [editItem, setEditItem] = useState<TopicDoc | null>(null);
  const [open, setOpen] = useState(false);

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'subjects'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subject));
    },
  });
  const sortedSubjects = [...subjects].sort((a, b) => a.name.localeCompare(b.name));

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['topics', subjectId],
    enabled: !!subjectId,
    queryFn: async () => {
      // A single equality filter needs no composite index; sort client-side
      // by `order` instead of adding orderBy (which would require one), and
      // this way admins can still see inactive topics to re-enable them.
      const q = query(collection(db, 'topics'), where('subjectId', '==', subjectId));
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TopicDoc));
      return rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TopicValues>({
    resolver: zodResolver(topicSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: TopicValues) => {
      if (!editItem) return;
      await updateDoc(doc(db, 'topics', editItem.id), {
        name: data.name,
        description: data.description,
        order: data.displayOrder,
        difficulty: data.difficulty,
        estimatedMinutes: data.estimatedMinutes,
        isActive: data.isActive,
        updatedAt: serverTimestamp(),
      });
      await logAudit('update', 'topics', editItem.id, data as unknown as Record<string, unknown>);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['topics', subjectId] });
      setOpen(false);
      reset();
      setEditItem(null);
      toast({ variant: 'success', title: 'Topic updated', description: 'Changes have been saved.' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Update failed', description: 'Could not save this topic. Please try again.' });
    },
  });

  const columns: Column<TopicDoc>[] = [
    { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'order', header: 'Order', render: (r) => r.order },
    { key: 'difficulty', header: 'Difficulty', render: (r) => <DifficultyBadge difficulty={r.difficulty} /> },
    { key: 'minutes', header: 'Est. Minutes', render: (r) => `${r.estimatedMinutes} min` },
    { key: 'active', header: 'Status', render: (r) => <Badge variant={r.isActive ? 'success' : 'secondary'}>{r.isActive ? 'Active' : 'Hidden'}</Badge> },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex gap-2 justify-end">
          <Button
            size="sm" variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setEditItem(r);
              reset({
                name: r.name, description: r.description ?? '', displayOrder: r.order,
                difficulty: r.difficulty, estimatedMinutes: r.estimatedMinutes, isActive: r.isActive,
              });
              setOpen(true);
            }}
          >
            <Pencil size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="max-w-xs space-y-2">
        <Label>Subject</Label>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
          <SelectContent>
            {sortedSubjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {!subjectId ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Select a subject to manage its topics.
        </div>
      ) : (
        <DataTable columns={columns} data={topics} isLoading={isLoading} emptyMessage="No topics for this subject" />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Topic</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" {...register('displayOrder', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Estimated Minutes</Label>
                <Input type="number" {...register('estimatedMinutes', { valueAsNumber: true })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Controller control={control} name="difficulty" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">Hide from students without deleting.</p>
              </div>
              <Controller control={control} name="isActive" render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )} />
            </div>
            {/* No create/delete here on purpose: each topic owns 5 learning_packs
                (and those own real seeded questions) — a hard delete would orphan
                that content, so admins can only edit metadata and toggle isActive
                to hide/show a topic instead of deleting it. */}
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

// --- Learning Packs Tab ---
// Real Firestore shape written by scripts/seed-content.mjs.
interface PackDoc {
  id: string;
  formId: string;
  subjectId: string;
  topicId: string;
  title: string;
  description?: string;
  type: 'mcq' | 'fib' | 'tf' | 'summary' | 'hoq';
  order: number;
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  isPremium: boolean;
  isActive: boolean;
  completionXP?: number;
  xpReward?: number;
}

const PACK_TYPE_LABELS: Record<string, string> = {
  mcq: 'MCQ', fib: 'Fill in Blank', tf: 'True/False', summary: 'Summary', hoq: 'Higher Order',
};

// Only metadata that's safe to change without desyncing from real seeded
// content: title/description/isPremium/difficulty/estimatedMinutes. `type`,
// `order`, and `questionCount` are structural — each pack maps 1:1 to real
// questions docs already seeded, so they're shown read-only in the dialog.
const packSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  isPremium: z.boolean(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  estimatedMinutes: z.number().min(1),
});
type PackValues = z.infer<typeof packSchema>;

function PacksTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [editItem, setEditItem] = useState<PackDoc | null>(null);
  const [open, setOpen] = useState(false);

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'subjects'));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subject));
    },
  });
  const sortedSubjects = [...subjects].sort((a, b) => a.name.localeCompare(b.name));

  const { data: topicsForSubject = [] } = useQuery({
    queryKey: ['topics', subjectId],
    enabled: !!subjectId,
    queryFn: async () => {
      const q = query(collection(db, 'topics'), where('subjectId', '==', subjectId));
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TopicDoc));
      return rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  });

  const { data: packs = [], isLoading } = useQuery({
    queryKey: ['learning_packs', topicId],
    enabled: !!topicId,
    queryFn: async () => {
      // Single equality filter (no orderBy) — should return exactly the 5
      // seeded packs (mcq/fib/tf/summary/hoq); sorted client-side by `order`.
      const q = query(collection(db, 'learning_packs'), where('topicId', '==', topicId));
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PackDoc));
      return rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<PackValues>({
    resolver: zodResolver(packSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: PackValues) => {
      if (!editItem) return;
      await updateDoc(doc(db, 'learning_packs', editItem.id), {
        title: data.title,
        description: data.description,
        isPremium: data.isPremium,
        difficulty: data.difficulty,
        estimatedMinutes: data.estimatedMinutes,
        updatedAt: serverTimestamp(),
      });
      await logAudit('update', 'learning_packs', editItem.id, data as unknown as Record<string, unknown>);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learning_packs', topicId] });
      setOpen(false);
      reset();
      setEditItem(null);
      toast({ variant: 'success', title: 'Learning pack updated', description: 'Changes have been saved.' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Update failed', description: 'Could not save this learning pack. Please try again.' });
    },
  });

  const columns: Column<PackDoc>[] = [
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium">{r.title}</span> },
    { key: 'type', header: 'Type', render: (r) => <Badge variant="info">{PACK_TYPE_LABELS[r.type] ?? r.type}</Badge> },
    { key: 'questionCount', header: 'Questions', render: (r) => r.questionCount },
    { key: 'premium', header: 'Access', render: (r) => <Badge variant={r.isPremium ? 'default' : 'secondary'}>{r.isPremium ? 'Premium' : 'Free'}</Badge> },
    { key: 'difficulty', header: 'Difficulty', render: (r) => <DifficultyBadge difficulty={r.difficulty} /> },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex gap-2 justify-end">
          <Button
            size="sm" variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setEditItem(r);
              reset({
                title: r.title, description: r.description ?? '', isPremium: r.isPremium,
                difficulty: r.difficulty, estimatedMinutes: r.estimatedMinutes,
              });
              setOpen(true);
            }}
          >
            <Pencil size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="w-56 space-y-2">
          <Label>Subject</Label>
          <Select value={subjectId} onValueChange={(v) => { setSubjectId(v); setTopicId(''); }}>
            <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
            <SelectContent>
              {sortedSubjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-56 space-y-2">
          <Label>Topic</Label>
          <Select value={topicId} onValueChange={setTopicId} disabled={!subjectId}>
            <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
            <SelectContent>
              {topicsForSubject.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!topicId ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Select a topic to manage its learning packs.
        </div>
      ) : (
        <DataTable columns={columns} data={packs} isLoading={isLoading} emptyMessage="No learning packs for this topic" />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Learning Pack</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
            {editItem && (
              <div className="grid grid-cols-3 gap-3 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <div><span className="block text-sm font-medium text-foreground">{PACK_TYPE_LABELS[editItem.type] ?? editItem.type}</span>Type</div>
                <div><span className="block text-sm font-medium text-foreground">{editItem.order}</span>Order</div>
                <div><span className="block text-sm font-medium text-foreground">{editItem.questionCount}</span>Questions</div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Controller control={control} name="difficulty" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-2">
                <Label>Estimated Minutes</Label>
                <Input type="number" {...register('estimatedMinutes', { valueAsNumber: true })} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <Label>Premium only</Label>
                <p className="text-xs text-muted-foreground">Restrict this pack to paying students.</p>
              </div>
              <Controller control={control} name="isPremium" render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )} />
            </div>
            {/* No add/delete here on purpose: packs map 1:1 to real seeded
                question docs (questionCount reflects them) — creating one with
                no questions or deleting one would orphan/break the mobile app. */}
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

export function CurriculumPage() {
  return (
    <div>
      <PageHeader title="Curriculum" subtitle="Manage forms, subjects, topics, and learning packs" />
      <div className="p-6">
        <Tabs defaultValue="forms">
          <TabsList className="mb-6">
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="packs">Learning Packs</TabsTrigger>
          </TabsList>
          <TabsContent value="forms"><FormsTab /></TabsContent>
          <TabsContent value="subjects"><SubjectsTab /></TabsContent>
          <TabsContent value="topics"><TopicsTab /></TabsContent>
          <TabsContent value="packs"><PacksTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
