import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp,
} from 'firebase/firestore';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../lib/firebase';
import { logAudit } from '../services/auditService';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
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
      if (editItem) {
        await updateDoc(doc(db, 'forms', editItem.id), { ...data, updatedAt: serverTimestamp() });
        await logAudit('update', 'forms', editItem.id, data as unknown as Record<string, unknown>);
      } else {
        const ref = await addDoc(collection(db, 'forms'), { ...data, createdAt: serverTimestamp() });
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
      if (editItem) {
        await updateDoc(doc(db, 'subjects', editItem.id), { ...data, updatedAt: serverTimestamp() });
        await logAudit('update', 'subjects', editItem.id, data as unknown as Record<string, unknown>);
      } else {
        const ref = await addDoc(collection(db, 'subjects'), { ...data, createdAt: serverTimestamp() });
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
          <TabsContent value="topics">
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Select a subject to manage its topics.
            </div>
          </TabsContent>
          <TabsContent value="packs">
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Select a topic to manage its learning packs.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
