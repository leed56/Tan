import { create } from 'zustand';
import type {
  CurriculumForm,
  CurriculumSubject,
  CurriculumTopic,
  CurriculumLearningPack,
} from '../types/curriculum';
import {
  getForms,
  getSubjectsByForm,
  getTopicsBySubject,
  getLearningPacksByTopic,
} from '../services/curriculumService';
import { SEED_FORMS } from '../utils/seedData';

interface CurriculumStore {
  // Selection state
  forms: CurriculumForm[];
  selectedFormId: string;

  // Data maps keyed for fast lookup
  subjectsByForm: Record<string, CurriculumSubject[]>;
  topicsBySubject: Record<string, CurriculumTopic[]>;      // key: `${formId}::${subjectId}`
  packsByTopic: Record<string, CurriculumLearningPack[]>;   // key: topicId

  // Loading & error
  loadingForms: boolean;
  loadingSubjects: boolean;
  loadingTopics: boolean;
  loadingPacks: boolean;
  error: string | null;

  // Actions
  setSelectedForm: (formId: string) => void;
  fetchForms: () => Promise<void>;
  fetchSubjects: (formId: string) => Promise<void>;
  fetchTopics: (formId: string, subjectId: string, force?: boolean) => Promise<void>;
  fetchLearningPacks: (formId: string, subjectId: string, topicId: string) => Promise<void>;
  clearError: () => void;
}

export const useCurriculumStore = create<CurriculumStore>((set, get) => ({
  forms: SEED_FORMS,
  selectedFormId: 'form_1',
  subjectsByForm: {},
  topicsBySubject: {},
  packsByTopic: {},
  loadingForms: false,
  loadingSubjects: false,
  loadingTopics: false,
  loadingPacks: false,
  error: null,

  setSelectedForm: (formId) => {
    set({ selectedFormId: formId });
    // Eagerly fetch subjects for the new form if not cached
    if (!get().subjectsByForm[formId]) {
      get().fetchSubjects(formId);
    }
  },

  fetchForms: async () => {
    set({ loadingForms: true, error: null });
    try {
      const forms = await getForms();
      set({ forms, loadingForms: false });
    } catch (e) {
      set({ loadingForms: false, error: String(e) });
    }
  },

  fetchSubjects: async (formId) => {
    // Return cached if available
    if (get().subjectsByForm[formId]) return;
    set({ loadingSubjects: true, error: null });
    try {
      const subjects = await getSubjectsByForm(formId);
      set((s) => ({
        subjectsByForm: { ...s.subjectsByForm, [formId]: subjects },
        loadingSubjects: false,
      }));
    } catch (e) {
      set({ loadingSubjects: false, error: String(e) });
    }
  },

  fetchTopics: async (formId, subjectId, force = false) => {
    // Keyed by form+subject, not subject alone — the same subject has
    // different topics on each Form, so caching by subjectId only would
    // reuse (or, worse, an empty result from) whichever Form was fetched
    // first for every other Form of that subject.
    const cacheKey = `${formId}::${subjectId}`;
    if (!force && get().topicsBySubject[cacheKey]) return;
    set({ loadingTopics: true, error: null });
    try {
      const topics = await getTopicsBySubject(formId, subjectId);
      set((s) => ({
        topicsBySubject: { ...s.topicsBySubject, [cacheKey]: topics },
        loadingTopics: false,
      }));
    } catch (e) {
      set({ loadingTopics: false, error: String(e) });
    }
  },

  fetchLearningPacks: async (formId, subjectId, topicId) => {
    if (get().packsByTopic[topicId]) return;
    set({ loadingPacks: true, error: null });
    try {
      const packs = await getLearningPacksByTopic(formId, subjectId, topicId);
      set((s) => ({
        packsByTopic: { ...s.packsByTopic, [topicId]: packs },
        loadingPacks: false,
      }));
    } catch (e) {
      set({ loadingPacks: false, error: String(e) });
    }
  },

  clearError: () => set({ error: null }),
}));
