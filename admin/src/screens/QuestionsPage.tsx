import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, limit, writeBatch,
} from 'firebase/firestore';
import { Plus, Pencil, Trash2, Upload, Eye } from 'lucide-react';
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
import { Textarea } from '../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { useToast } from '../components/ui/use-toast';
import type { Question } from '../types';

// ── CSV import ──────────────────────────────────────────────────────────────
// Hand-rolled parser (no CSV dependency in package.json): handles quoted
// fields containing commas/newlines and "" escaped quotes, RFC4180-ish.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const endField = () => { row.push(field); field = ''; };
  const endRow = () => { endField(); rows.push(row); row = []; };
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      endField();
    } else if (c === '\n') {
      endRow();
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) endRow();
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
}

const VALID_TYPES = ['mcq', 'fib', 'tf', 'hoq'] as const;
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const REQUIRED_CSV_HEADERS = [
  'formId', 'subjectId', 'topicId', 'learningPackId', 'type', 'questionText',
  'correctAnswer', 'explanation', 'difficulty',
];
const CSV_HEADER_EXAMPLE =
  'formId,subjectId,topicId,learningPackId,type,questionText,optionA,optionB,optionC,optionD,correctAnswer,explanation,difficulty,xpReward,isPremium';

interface ImportRow {
  formId: string;
  subjectId: string;
  topicId: string;
  learningPackId: string;
  type: typeof VALID_TYPES[number];
  questionText: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  difficulty: typeof VALID_DIFFICULTIES[number];
  xpReward: number;
  isPremium: boolean;
}

function parseBool(v: string): boolean {
  const s = v.trim().toLowerCase();
  return s === 'true' || s === '1';
}

function parseCsvFile(text: string): { rows: ImportRow[]; errors: string[] } {
  const table = parseCsv(text);
  if (table.length === 0) return { rows: [], errors: ['CSV file is empty.'] };

  const header = table[0].map((h) => h.trim());
  const missing = REQUIRED_CSV_HEADERS.filter((h) => !header.includes(h));
  if (missing.length) {
    return { rows: [], errors: [`Missing required column(s): ${missing.join(', ')}`] };
  }

  const colIndex = (name: string) => header.indexOf(name);
  const get = (cols: string[], name: string) => {
    const i = colIndex(name);
    return i === -1 ? '' : (cols[i] ?? '').trim();
  };

  const rows: ImportRow[] = [];
  const errors: string[] = [];

  for (let r = 1; r < table.length; r++) {
    const cols = table[r];
    if (cols.length === 1 && cols[0].trim() === '') continue; // blank line
    const rowNum = r + 1; // 1-indexed, header is row 1

    const formId = get(cols, 'formId');
    const subjectId = get(cols, 'subjectId');
    const topicId = get(cols, 'topicId');
    const learningPackId = get(cols, 'learningPackId');
    const rawType = get(cols, 'type');
    const type = rawType.toLowerCase();
    const questionText = get(cols, 'questionText');
    const correctAnswer = get(cols, 'correctAnswer');
    const explanation = get(cols, 'explanation');
    const rawDifficulty = get(cols, 'difficulty');
    const difficulty = rawDifficulty.toLowerCase();
    const optionA = get(cols, 'optionA');
    const optionB = get(cols, 'optionB');
    const optionC = get(cols, 'optionC');
    const optionD = get(cols, 'optionD');
    const xpRewardRaw = get(cols, 'xpReward');
    const isPremiumRaw = get(cols, 'isPremium');

    const rowErrors: string[] = [];
    if (!formId) rowErrors.push('formId is required');
    if (!subjectId) rowErrors.push('subjectId is required');
    if (!topicId) rowErrors.push('topicId is required');
    if (!learningPackId) rowErrors.push('learningPackId is required');
    if (!questionText) rowErrors.push('questionText is required');
    if (!correctAnswer) rowErrors.push('correctAnswer is required');
    if (!explanation) rowErrors.push('explanation is required');
    if (!(VALID_TYPES as readonly string[]).includes(type)) {
      rowErrors.push(`type must be one of mcq/fib/tf/hoq (got "${rawType}")`);
    }
    if (!(VALID_DIFFICULTIES as readonly string[]).includes(difficulty)) {
      rowErrors.push(`difficulty must be one of easy/medium/hard (got "${rawDifficulty}")`);
    }

    if (rowErrors.length) {
      errors.push(`Row ${rowNum}: ${rowErrors.join('; ')}`);
      continue;
    }

    const options = [
      { id: 'a', text: optionA },
      { id: 'b', text: optionB },
      { id: 'c', text: optionC },
      { id: 'd', text: optionD },
    ].filter((o) => o.text !== '');

    const xpReward = xpRewardRaw !== '' && !Number.isNaN(Number(xpRewardRaw)) ? Number(xpRewardRaw) : 10;
    const isPremium = parseBool(isPremiumRaw);

    rows.push({
      formId, subjectId, topicId, learningPackId,
      type: type as ImportRow['type'],
      questionText, options, correctAnswer, explanation,
      difficulty: difficulty as ImportRow['difficulty'],
      xpReward, isPremium,
    });
  }

  return { rows, errors };
}

const TYPE_LABELS: Record<string, string> = { mcq: 'MCQ', fib: 'FIB', tf: 'T/F', hoq: 'HOQ' };
type BadgeVariant = 'info' | 'success' | 'warning' | 'secondary';
const TYPE_VARIANTS: Record<string, BadgeVariant> = { mcq: 'info', fib: 'success', tf: 'warning', hoq: 'secondary' };

const questionSchema = z.object({
  questionText: z.string().min(5),
  type: z.enum(['mcq', 'fib', 'tf', 'hoq']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(5),
  xpReward: z.number().min(1),
  packId: z.string().min(1),
  subjectId: z.string().min(1),
  topicId: z.string().min(1),
  formId: z.string().min(1),
  hasLatex: z.boolean(),
});

type QuestionValues = z.infer<typeof questionSchema>;

export function QuestionsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editItem, setEditItem] = useState<Question | null>(null);
  const [deleteItem, setDeleteItem] = useState<Question | null>(null);
  const [open, setOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<Question | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'), limit(200));
      const snap = await getDocs(q);
      // Seeded docs store type UPPERCASE (rules-enforced); normalize so the
      // lowercase filter tabs and badges match them.
      return snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data, type: String(data.type).toLowerCase() } as Question;
      });
    },
  });

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<QuestionValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: { type: 'mcq', difficulty: 'medium', xpReward: 10, hasLatex: false },
  });

  const questionType = watch('type');

  const mutation = useMutation({
    mutationFn: async (data: QuestionValues) => {
      // Contract with the app + rules: rules only accept UPPERCASE type; the
      // quiz query filters on learningPackId + isActive and sorts by order,
      // so docs missing those fields are invisible in every quiz. On edit,
      // options must be preserved — writing [] stripped seeded MCQs of all
      // four answers.
      const payload = {
        ...data,
        type: data.type.toUpperCase(),
        learningPackId: data.packId,
        updatedAt: serverTimestamp(),
      };
      if (editItem) {
        await updateDoc(doc(db, 'questions', editItem.id), payload);
        await logAudit('update', 'questions', editItem.id, { type: data.type });
      } else {
        const ref = await addDoc(collection(db, 'questions'), {
          ...payload,
          options: [],
          isActive: true,
          order: 999,
          isPremium: false,
          createdAt: serverTimestamp(),
        });
        await logAudit('create', 'questions', ref.id, { type: data.type });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['questions'] }); setOpen(false); reset(); setEditItem(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'questions', id));
      await logAudit('delete', 'questions', id, {});
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['questions'] }); setDeleteItem(null); },
  });

  const resetImportState = () => {
    setImportRows([]);
    setImportErrors([]);
    setImportFileName('');
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file after fixing errors
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const { rows, errors } = parseCsvFile(text);
      setImportErrors(errors);
      setImportRows(errors.length ? [] : rows);
    };
    reader.onerror = () => {
      setImportErrors(['Could not read the file.']);
      setImportRows([]);
    };
    reader.readAsText(file);
  };

  const importMutation = useMutation({
    mutationFn: async (rows: ImportRow[]) => {
      const batchId = Date.now();
      let written = 0;
      for (let i = 0; i < rows.length; i += 400) {
        const chunk = rows.slice(i, i + 400);
        const batch = writeBatch(db);
        chunk.forEach((row, j) => {
          const index = written + j;
          const id = `${row.topicId}_${row.type}_admin_${batchId}_${index}`;
          batch.set(doc(db, 'questions', id), {
            id,
            formId: row.formId,
            subjectId: row.subjectId,
            topicId: row.topicId,
            learningPackId: row.learningPackId,
            type: row.type.toUpperCase(),
            questionText: row.questionText,
            options: row.options,
            correctAnswer: row.correctAnswer,
            explanation: row.explanation,
            difficulty: row.difficulty,
            xpReward: row.xpReward,
            order: index + 1,
            isActive: true,
            isPremium: row.isPremium,
            imagePrompt: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
        written += chunk.length;
      }
      return written;
    },
    onSuccess: async (count) => {
      qc.invalidateQueries({ queryKey: ['questions'] });
      await logAudit('bulk_import', 'questions', 'csv-import', { count });
      toast({ variant: 'success', title: `Imported ${count} questions` });
      setImportOpen(false);
      resetImportState();
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Import failed', description: 'No questions were imported.' });
    },
  });

  const filtered = questions.filter((q) => {
    const matchType = filterType === 'all' || q.type === filterType;
    const matchSearch = !search || q.questionText.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const columns: Column<Question>[] = [
    {
      key: 'question', header: 'Question', render: (r) => (
        <p className="line-clamp-2 text-sm max-w-md">{r.questionText}</p>
      ),
    },
    { key: 'type', header: 'Type', render: (r) => <Badge variant={TYPE_VARIANTS[r.type] ?? 'secondary'}>{TYPE_LABELS[r.type] ?? r.type}</Badge> },
    { key: 'difficulty', header: 'Difficulty', render: (r) => <DifficultyBadge difficulty={r.difficulty} /> },
    { key: 'xp', header: 'XP', render: (r) => <span className="text-amber-400 font-medium">+{r.xpReward}</span> },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setPreviewItem(r); }}><Eye size={14} /></Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditItem(r); reset({ questionText: r.questionText, type: r.type, difficulty: r.difficulty, correctAnswer: r.correctAnswer, explanation: r.explanation, xpReward: r.xpReward, packId: r.packId, subjectId: r.subjectId, topicId: r.topicId, formId: r.formId, hasLatex: r.hasLatex ?? false }); setOpen(true); }}><Pencil size={14} /></Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteItem(r); }}><Trash2 size={14} className="text-destructive" /></Button>
        </div>
      ),
    },
  ];

  const defaultValues: QuestionValues = {
    type: 'mcq', difficulty: 'medium', xpReward: 10, hasLatex: false,
    questionText: '', correctAnswer: '', explanation: '',
    packId: '', subjectId: '', topicId: '', formId: '',
  };

  return (
    <div>
      <PageHeader
        title="Question Bank"
        subtitle={`${questions.length} questions across all subjects`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => { resetImportState(); setImportOpen(true); }}>
              <Upload size={14} className="mr-2" /> Import CSV
            </Button>
            <Button size="sm" onClick={() => { reset(defaultValues); setEditItem(null); setOpen(true); }}>
              <Plus size={16} className="mr-2" /> Add Question
            </Button>
          </>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex gap-2">
            {['all', 'mcq', 'fib', 'tf', 'hoq'].map((t) => (
              <Button key={t} size="sm" variant={filterType === t ? 'default' : 'outline'} onClick={() => setFilterType(t)}>
                {t === 'all' ? 'All' : TYPE_LABELS[t] ?? t}
              </Button>
            ))}
          </div>
        </div>

        <DataTable columns={columns} data={filtered} isLoading={isLoading} emptyMessage="No questions found" />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
            <DialogTitle>{editItem ? 'Edit Question' : 'Add Question'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

              {/* Row 1: Type / Difficulty / XP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Controller control={control} name="type" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">MCQ</SelectItem>
                        <SelectItem value="fib">Fill in Blank</SelectItem>
                        <SelectItem value="tf">True / False</SelectItem>
                        <SelectItem value="hoq">HOQ</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
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
                <div className="space-y-2">
                  <Label>XP Reward</Label>
                  <Input type="number" className="w-full" {...register('xpReward', { valueAsNumber: true })} />
                </div>
              </div>

              {/* Question text */}
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea {...register('questionText')} placeholder="Enter question..." rows={3} className="w-full resize-none" />
                {errors.questionText && <p className="text-xs text-destructive">{errors.questionText.message}</p>}
              </div>

              {/* Correct Answer */}
              {questionType === 'tf' ? (
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Controller control={control} name="correctAnswer" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select answer" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Correct Answer {questionType === 'mcq' ? '(a / b / c / d)' : ''}</Label>
                  <Input className="w-full" {...register('correctAnswer')} placeholder={questionType === 'mcq' ? 'a' : 'Expected answer'} />
                  {errors.correctAnswer && <p className="text-xs text-destructive">{errors.correctAnswer.message}</p>}
                </div>
              )}

              {/* Explanation */}
              <div className="space-y-2">
                <Label>Explanation</Label>
                <Textarea {...register('explanation')} placeholder="Explain the correct answer..." rows={2} className="w-full resize-none" />
                {errors.explanation && <p className="text-xs text-destructive">{errors.explanation.message}</p>}
              </div>

              {/* IDs grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Subject ID</Label>
                  <Input className="w-full" {...register('subjectId')} placeholder="e.g. math" />
                  {errors.subjectId && <p className="text-xs text-destructive">{errors.subjectId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Form ID</Label>
                  <Input className="w-full" {...register('formId')} placeholder="e.g. form_1" />
                  {errors.formId && <p className="text-xs text-destructive">{errors.formId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Topic ID</Label>
                  <Input className="w-full" {...register('topicId')} placeholder="e.g. algebra" />
                  {errors.topicId && <p className="text-xs text-destructive">{errors.topicId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Pack ID</Label>
                  <Input className="w-full" {...register('packId')} placeholder="e.g. pack_01" />
                  {errors.packId && <p className="text-xs text-destructive">{errors.packId.message}</p>}
                </div>
              </div>

            </div>

            {/* Footer always visible */}
            <DialogFooter className="px-6 py-4 border-t border-border shrink-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : editItem ? 'Update' : 'Add Question'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewItem} onOpenChange={(v) => !v && setPreviewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Question Preview</DialogTitle></DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant={TYPE_VARIANTS[previewItem.type] ?? 'secondary'}>{TYPE_LABELS[previewItem.type] ?? previewItem.type}</Badge>
                <DifficultyBadge difficulty={previewItem.difficulty} />
                <Badge variant="warning">+{previewItem.xpReward} XP</Badge>
              </div>
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-sm font-medium">{previewItem.questionText}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-muted-foreground">Correct Answer</p>
                <p className="text-sm font-medium text-emerald-400">{previewItem.correctAnswer}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-muted-foreground">Explanation</p>
                <p className="text-sm">{previewItem.explanation}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={(v) => { setImportOpen(v); if (!v) resetImportState(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Questions from CSV</DialogTitle>
            <DialogDescription>
              Header row required: <code className="text-[11px]">{CSV_HEADER_EXAMPLE}</code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              For <code>type=tf</code>, leave optionA-D blank and set correctAnswer to <code>true</code>/<code>false</code>.
              xpReward defaults to 10 if blank; isPremium accepts true/false/1/0.
            </p>

            <Input type="file" accept=".csv" onChange={handleImportFileChange} />

            {importFileName && !importErrors.length && !importRows.length && (
              <p className="text-xs text-muted-foreground">Parsing {importFileName}...</p>
            )}

            {importErrors.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-destructive">
                  {importErrors.length} error(s) found — fix the CSV and re-upload:
                </p>
                <div className="max-h-48 overflow-y-auto rounded-md border border-border p-2 space-y-1">
                  {importErrors.map((err, i) => (
                    <p key={i} className="text-xs text-destructive">{err}</p>
                  ))}
                </div>
              </div>
            )}

            {!importErrors.length && importRows.length > 0 && (
              <p className="text-sm text-emerald-400">{importRows.length} question(s) parsed and ready to import.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button
              type="button"
              disabled={!importRows.length || importErrors.length > 0 || importMutation.isPending}
              onClick={() => importMutation.mutate(importRows)}
            >
              {importMutation.isPending ? 'Importing...' : `Import ${importRows.length || ''} Question(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)}
        title="Delete Question" description="This question will be permanently deleted."
        confirmLabel="Delete" variant="destructive"
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
