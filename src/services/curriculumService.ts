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

import { firestore, isFirebaseConfigured, waitForAuthReady } from './firebaseConfig';
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

// ─── Forms ────────────────────────────────────────────────────────────────────

export async function getForms(): Promise<CurriculumForm[]> {
  if (!isFirebaseConfigured()) return SEED_FORMS;
  try {
    await waitForAuthReady();
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
    await waitForAuthReady();
    const snap = await getDocs(
      query(
        collection(firestore, COLLECTIONS.subjects),
        where('formId', '==', formId),
        where('isActive', '==', true),
        orderBy('order'),
      ),
    );
    if (snap.empty) {
      console.warn(
        `[curriculumService] getSubjectsByForm: Firestore query for formId="${formId}" succeeded but matched 0 real docs — falling back to local seed data.`,
      );
      return getSeedSubjects()
        .filter((s) => s.formId === formId)
        .sort((a, b) => a.order - b.order);
    }
    return snap.docs.map((d) => d.data() as CurriculumSubject);
  } catch (e) {
    console.warn(
      `[curriculumService] getSubjectsByForm: Firestore query for formId="${formId}" threw — falling back to local seed data. Error:`,
      e,
    );
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
    await waitForAuthReady();
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
      console.warn(
        `[curriculumService] getTopicsBySubject: Firestore query for formId="${formId}" subjectId="${subjectId}" succeeded but matched 0 real docs — falling back to local seed data.`,
      );
      return getSeedTopics()
        .filter((t) => t.formId === formId && t.subjectId === subjectId)
        .sort((a, b) => a.order - b.order);
    }
    return snap.docs.map((d) => d.data() as CurriculumTopic);
  } catch (e) {
    console.warn(
      `[curriculumService] getTopicsBySubject: Firestore query for formId="${formId}" subjectId="${subjectId}" threw — falling back to local seed data. Error:`,
      e,
    );
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
    await waitForAuthReady();
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
      console.warn(
        `[curriculumService] getLearningPacksByTopic: Firestore query for formId="${formId}" subjectId="${subjectId}" topicId="${topicId}" succeeded but matched 0 real docs — falling back to local seed data.`,
      );
      return getSeedLearningPacks()
        .filter(
          (p) =>
            p.formId === formId && p.subjectId === subjectId && p.topicId === topicId,
        )
        .sort((a, b) => a.order - b.order);
    }
    return snap.docs.map((d) => {
      // DB pack docs store `xpReward`; the app reads `completionXP`. Backfill so
      // pack/completion screens don't show undefined XP.
      const data = d.data() as CurriculumLearningPack & { xpReward?: number };
      return { ...data, completionXP: data.completionXP ?? data.xpReward ?? 0 };
    });
  } catch (e) {
    console.warn(
      `[curriculumService] getLearningPacksByTopic: Firestore query for formId="${formId}" subjectId="${subjectId}" topicId="${topicId}" threw — falling back to local seed data. Error:`,
      e,
    );
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
