import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection, getDocs, addDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { format } from 'date-fns';
import { Upload, Trash2, FileText, ExternalLink, Plus } from 'lucide-react';
import { db, storage } from '../lib/firebase';
import { logAudit } from '../services/auditService';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';

interface PastPaper {
  id: string;
  title: string;
  subject: string;
  year: number;
  formId: string;
  pdfUrl: string;
  storagePath: string;
  uploadedAt: Date;
}

interface Summary {
  id: string;
  title: string;
  subjectId: string;
  formId: string;
  content: string;
  createdAt: Date;
}

function PastPapersTab() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<PastPaper | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState({ title: '', subject: '', year: new Date().getFullYear(), formId: 'form_4' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: papers = [], isLoading } = useQuery({
    queryKey: ['past_papers'],
    queryFn: async () => {
      const q = query(collection(db, 'past_papers'), orderBy('year', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data(), uploadedAt: d.data().uploadedAt?.toDate() ?? new Date() } as PastPaper));
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('No file selected');
      const path = `past_papers/${Date.now()}_${selectedFile.name}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, selectedFile);
      await new Promise<void>((resolve, reject) => {
        task.on('state_changed', (snap) => setUploadProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)), reject, resolve);
      });
      const url = await getDownloadURL(storageRef);
      const docRef = await addDoc(collection(db, 'past_papers'), { ...form, pdfUrl: url, storagePath: path, uploadedAt: serverTimestamp() });
      await logAudit('create', 'past_papers', docRef.id, { title: form.title });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['past_papers'] }); setOpen(false); setSelectedFile(null); setUploadProgress(0); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (paper: PastPaper) => {
      if (paper.storagePath) await deleteObject(ref(storage, paper.storagePath)).catch(() => {});
      await deleteDoc(doc(db, 'past_papers', paper.id));
      await logAudit('delete', 'past_papers', paper.id, {});
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['past_papers'] }); setDeleteItem(null); },
  });

  const columns: Column<PastPaper>[] = [
    { key: 'title', header: 'Title', render: (r) => <div className="flex items-center gap-2"><FileText size={16} className="text-muted-foreground" /><span className="font-medium">{r.title}</span></div> },
    { key: 'subject', header: 'Subject', render: (r) => <span>{r.subject}</span> },
    { key: 'year', header: 'Year', render: (r) => <Badge variant="secondary">{r.year}</Badge> },
    { key: 'form', header: 'Form', render: (r) => <span className="text-xs text-muted-foreground">{r.formId}</span> },
    { key: 'uploaded', header: 'Uploaded', render: (r) => <span className="text-xs text-muted-foreground">{format(r.uploadedAt, 'MMM d, yyyy')}</span> },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); window.open(r.pdfUrl, '_blank'); }}><ExternalLink size={14} /></Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteItem(r); }}><Trash2 size={14} className="text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}><Upload size={16} className="mr-2" /> Upload PDF</Button>
      </div>
      <DataTable columns={columns} data={papers} isLoading={isLoading} emptyMessage="No past papers yet" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Past Paper</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="NECTA 2024 Mathematics" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Mathematics" /></div>
              <div className="space-y-2"><Label>Year</Label><Input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))} /></div>
            </div>
            <div className="space-y-2">
              <Label>Form ID</Label>
              <Input value={form.formId} onChange={(e) => setForm((f) => ({ ...f, formId: e.target.value }))} placeholder="form_4" />
            </div>
            <div className="space-y-2">
              <Label>PDF File</Label>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>Choose File</Button>
                <span className="text-sm text-muted-foreground">{selectedFile?.name ?? 'No file chosen'}</span>
              </div>
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{uploadProgress}% uploaded</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => uploadMutation.mutate()} disabled={!selectedFile || uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)}
        title="Delete Past Paper" description={`Delete "${deleteItem?.title}"? The PDF will also be removed from storage.`}
        confirmLabel="Delete" variant="destructive"
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function SummariesTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Summary | null>(null);
  const [form, setForm] = useState({ title: '', subjectId: '', formId: '', content: '' });

  const { data: summaries = [], isLoading } = useQuery({
    queryKey: ['summaries'],
    queryFn: async () => {
      const q = query(collection(db, 'summaries'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() ?? new Date() } as Summary));
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const docRef = await addDoc(collection(db, 'summaries'), { ...form, createdAt: serverTimestamp() });
      await logAudit('create', 'summaries', docRef.id, { title: form.title });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['summaries'] });
      setOpen(false);
      setForm({ title: '', subjectId: '', formId: '', content: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'summaries', id));
      await logAudit('delete', 'summaries', id, {});
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['summaries'] }); setDeleteItem(null); },
  });

  const columns: Column<Summary>[] = [
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium">{r.title}</span> },
    { key: 'subject', header: 'Subject ID', render: (r) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{r.subjectId}</code> },
    { key: 'form', header: 'Form', render: (r) => <span className="text-xs text-muted-foreground">{r.formId}</span> },
    { key: 'preview', header: 'Preview', render: (r) => <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{r.content}</p> },
    { key: 'date', header: 'Created', render: (r) => <span className="text-xs text-muted-foreground">{format(r.createdAt, 'MMM d, yyyy')}</span> },
    {
      key: 'actions', header: '', render: (r) => (
        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteItem(r); }}>
          <Trash2 size={14} className="text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}><Plus size={16} className="mr-2" /> New Summary</Button>
      </div>
      <DataTable columns={columns} data={summaries} isLoading={isLoading} emptyMessage="No summaries yet" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Create Summary</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Chapter 1: Introduction to Algebra" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Subject ID</Label><Input value={form.subjectId} onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Form ID</Label><Input value={form.formId} onChange={(e) => setForm((f) => ({ ...f, formId: e.target.value }))} /></div>
            </div>
            <div className="space-y-2">
              <Label>Content (Markdown supported)</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={10}
                placeholder="# Chapter Summary&#10;&#10;## Key Concepts&#10;..."
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!form.title || !form.content || createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Save Summary'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)} title="Delete Summary" description={`Delete "${deleteItem?.title}"?`} confirmLabel="Delete" variant="destructive" onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)} isLoading={deleteMutation.isPending} />
    </div>
  );
}

export function ContentPage() {
  return (
    <div>
      <PageHeader title="Content" subtitle="Manage past papers and study summaries" />
      <div className="p-6">
        <Tabs defaultValue="papers">
          <TabsList className="mb-6">
            <TabsTrigger value="papers">Past Papers</TabsTrigger>
            <TabsTrigger value="summaries">Summaries</TabsTrigger>
          </TabsList>
          <TabsContent value="papers"><PastPapersTab /></TabsContent>
          <TabsContent value="summaries"><SummariesTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
