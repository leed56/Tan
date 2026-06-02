/**
 * Curriculum Service — Phase 2
 *
 * Strategy:
 *   1. Try Firestore (when Firebase is configured and online).
 *   2. Fall back to local seed data seamlessly.
 * This means the app works 100% offline / unconfigured in development.
 *
 * TODO: Phase 3 — add Firestore write (admin seeding) and real-time listeners
 * TODO: Phase 3 — add caching layer (AsyncStorage) for offline-first
 */

import { firestore } from './firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import type {
  CurriculumForm,
  CurriculumSubject,
  CurriculumTopic,
  CurriculumLearningPack,
} from '../types/curriculum';
import {
  SEED_FORMS,
  getSeedSubjects,
  getSeedTopics,
  getSeedLearningPacks,
} from '../utils/seedData';
import { COLLECTIONS } from './firebaseConfig';

// ─── Check if Firebase is configured ─────────────────────────────────────────

function isFirebaseConfigured(): boolean {
  // TODO: Phase 3 — replace with proper connectivity check
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '';
  return projectId.length > 0;
}

// ─── Forms ────────────────────────────────────────────────────────────────────

export async function getForms(): Promise<CurriculumForm[]> {
  if (!isFirebaseConfigured()) return SEED_FORMS;
  try {
    const snap = await getDocs(
      query(collection(firestore, COLLECTIONS.forms), orderBy('order')),
    );
    if (snap.empty) return SEED_FORMS;
    return snap.docs.map((d) => d.data() as CurriculumForm);
  } catch {
    return SEED_FORMS;
  }
}

// ─── Subjects ─────────────────────────────────────────────────────────────────

export async function getSubjectsByForm(formId: string): Promise<CurriculumSubject[]> {
  if (!isFirebaseConfigured()) {
    return getSeedSubjects()
      .filter((s) => s.formId === formId)
      .sort((a, b) => a.order - b.order);
  }
  try {
    const snap = await getDocs(
      query(
        collection(firestore, COLLECTIONS.subjects),
        where('formId', '==', formId),
        where('isActive', '==', true),
        orderBy('order'),
      ),
    );
    if (snap.empty) {
      return getSeedSubjects()
        .filter((s) => s.formId === formId)
        .sort((a, b) => a.order - b.order);
    }
    return snap.docs.map((d) => d.data() as CurriculumSubject);
  } catch {
    return getSeedSubjects()
      .filter((s) => s.formId === formId)
      .sort((a, b) => a.order - b.order);
  }
}

// ─── Topics ───────────────────────────────────────────────────────────────────

export async function getTopicsBySubject(
  formId: string,
  subjectId: string,
): Promise<CurriculumTopic[]> {
  if (!isFirebaseConfigured()) {
    return getSeedTopics()
      .filter((t) => t.formId === formId && t.subjectId === subjectId)
      .sort((a, b) => a.order - b.order);
  }
  try {
    const snap = await getDocs(
      query(
        collection(firestore, COLLECTIONS.topics),
        where('formId', '==', formId),
        where('subjectId', '==', subjectId),
        where('isActive', '==', true),
        orderBy('order'),
      ),
    );
    if (snap.empty) {
      return getSeedTopics()
        .filter((t) => t.formId === formId && t.subjectId === subjectId)
        .sort((a, b) => a.order - b.order);
    }
    return snap.docs.map((d) => d.data() as CurriculumTopic);
  } catch {
    return getSeedTopics()
      .filter((t) => t.formId === formId && t.subjectId === subjectId)
      .sort((a, b) => a.order - b.order);
  }
}

// ─── Learning Packs ───────────────────────────────────────────────────────────

export async function getLearningPacksByTopic(
  formId: string,
  subjectId: string,
  topicId: string,
): Promise<CurriculumLearningPack[]> {
  if (!isFirebaseConfigured()) {
    return getSeedLearningPacks()
      .filter(
        (p) => p.formId === formId && p.subjectId === subjectId && p.topicId === topicId,
      )
      .sort((a, b) => a.order - b.order);
  }
  try {
    const snap = await getDocs(
      query(
        collection(firestore, COLLECTIONS.learningPacks),
        where('formId', '==', formId),
        where('subjectId', '==', subjectId),
        where('topicId', '==', topicId),
        where('isActive', '==', true),
        orderBy('order'),
      ),
    );
    if (snap.empty) {
      return getSeedLearningPacks()
        .filter(
          (p) =>
            p.formId === formId && p.subjectId === subjectId && p.topicId === topicId,
        )
        .sort((a, b) => a.order - b.order);
    }
    return snap.docs.map((d) => d.data() as CurriculumLearningPack);
  } catch {
    return getSeedLearningPacks()
      .filter(
        (p) => p.formId === formId && p.subjectId === subjectId && p.topicId === topicId,
      )
      .sort((a, b) => a.order - b.order);
  }
}

// ─── Get pack count for a subject (for enrichment) ────────────────────────────

export function getTopicCountForSubject(formId: string, subjectId: string): number {
  return getSeedTopics().filter(
    (t) => t.formId === formId && t.subjectId === subjectId && t.isActive,
  ).length;
}

export function getPackCountForTopic(topicId: string): number {
  return getSeedLearningPacks().filter((p) => p.topicId === topicId && p.isActive).length;
}

// ─── Seed Firestore (run once from admin / onboarding) ────────────────────────
// TODO: Phase 3 — move this to a Cloud Function or admin script

export async function seedFirestore(): Promise<void> {
  if (!isFirebaseConfigured()) {
    console.warn('[curriculumService] Firebase not configured — skipping Firestore seed.');
    return;
  }
  const batch = writeBatch(firestore);

  for (const form of SEED_FORMS) {
    batch.set(doc(firestore, COLLECTIONS.forms, form.id), form);
  }
  for (const subject of getSeedSubjects()) {
    batch.set(doc(firestore, COLLECTIONS.subjects, subject.id), subject);
  }
  await batch.commit();

  // Topics and packs are too large for one batch — write in chunks
  const topics = getSeedTopics();
  for (let i = 0; i < topics.length; i += 400) {
    const chunk = topics.slice(i, i + 400);
    const b = writeBatch(firestore);
    chunk.forEach((t) => b.set(doc(firestore, COLLECTIONS.topics, t.id), t));
    await b.commit();
  }

  const packs = getSeedLearningPacks();
  for (let i = 0; i < packs.length; i += 400) {
    const chunk = packs.slice(i, i + 400);
    const b = writeBatch(firestore);
    chunk.forEach((p) => b.set(doc(firestore, COLLECTIONS.learningPacks, p.id), p));
    await b.commit();
  }
}
