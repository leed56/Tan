import { create } from 'zustand';
import type { StudentProgress, SubjectProgressSummary, TopicProgressSummary } from '../types/curriculum';
import {
  getStudentProgress,
  updateLearningPackProgress,
  aggregateSubjectProgress,
  aggregateTopicProgress,
  aggregatePackProgress,
  type ProgressUpdate,
} from '../services/progressService';

interface ProgressStore {
  records: StudentProgress[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchProgress: (userId: string) => Promise<void>;
  updateProgress: (userId: string, packId: string, data: ProgressUpdate) => Promise<void>;

  // Selectors (derived synchronously from records)
  getSubjectProgress: (subjectId: string) => SubjectProgressSummary;
  getTopicProgress: (topicId: string, totalPacks: number) => TopicProgressSummary;
  getPackProgress: (packId: string) => { progressPercent: number; isCompleted: boolean };

  clearError: () => void;
}

const DEFAULT_SUBJECT_PROGRESS: Omit<SubjectProgressSummary, 'subjectId'> = {
  totalPacks: 0,
  completedPacks: 0,
  inProgressPacks: 0,
  progressPercent: 0,
  totalXpEarned: 0,
};

export const useProgressStore = create<ProgressStore>((set, get) => ({
  records: [],
  loading: false,
  error: null,

  fetchProgress: async (userId) => {
    set({ loading: true, error: null });
    try {
      const records = await getStudentProgress(userId);
      set({ records, loading: false });
    } catch (e) {
      set({ loading: false, error: String(e) });
    }
  },

  updateProgress: async (userId, packId, data) => {
    // Optimistic local update first, then persist
    const id = `${userId}_${packId}`;
    const existing = get().records.find((r) => r.id === id);
    const updated: StudentProgress = {
      id,
      userId,
      formId: data.formId,
      subjectId: data.subjectId,
      topicId: data.topicId,
      learningPackId: packId,
      progressPercent: data.progressPercent,
      status: data.isCompleted ? 'completed' : data.progressPercent > 0 ? 'in_progress' : 'not_started',
      lastOpenedAt: Date.now(),
      completedAt: data.isCompleted ? Date.now() : existing?.completedAt ?? null,
      xpEarned: data.xpEarned,
    };
    set((s) => ({
      records: [
        ...s.records.filter((r) => r.id !== id),
        updated,
      ],
    }));
    // Persist to Firestore (fire-and-forget; errors are swallowed)
    await updateLearningPackProgress(userId, packId, data).catch(() => {});
  },

  getSubjectProgress: (subjectId) =>
    aggregateSubjectProgress(subjectId, get().records),

  getTopicProgress: (topicId, totalPacks) =>
    aggregateTopicProgress(topicId, get().records, totalPacks),

  getPackProgress: (packId) =>
    aggregatePackProgress(packId, get().records),

  clearError: () => set({ error: null }),
}));
