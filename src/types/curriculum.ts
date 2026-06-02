// ─── Phase 2 Firestore Curriculum Types ───────────────────────────────────────
// These are separate from Phase 1 types to avoid conflicts.

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

// Firestore: forms collection
export interface CurriculumForm {
  id: string;
  name: string;      // "Form 1", "Form 2", etc.
  order: number;     // 1..4
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Firestore: subjects collection
export interface CurriculumSubject {
  id: string;
  formId: string;
  name: string;
  description: string;
  icon: string;           // Ionicons glyph name
  color: string;          // primary hex
  gradientColors: string[];
  order: number;
  isCore: boolean;        // core vs optional subject
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Firestore: topics collection
export interface CurriculumTopic {
  id: string;
  formId: string;
  subjectId: string;
  name: string;
  description: string;
  order: number;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Firestore: learning_packs collection
export type CurriculumPackType = 'mcq' | 'fib' | 'tf' | 'hoq' | 'summary';

export interface CurriculumLearningPack {
  id: string;
  formId: string;
  subjectId: string;
  topicId: string;
  title: string;
  description: string;
  type: CurriculumPackType;
  order: number;
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  questionCount: number;
  isPremium: boolean;
  isActive: boolean;
  completionXP: number;
  createdAt: number;
  updatedAt: number;
}

// Firestore: student_progress collection
export interface StudentProgress {
  id: string;             // userId_learningPackId
  userId: string;
  formId: string;
  subjectId: string;
  topicId: string;
  learningPackId: string;
  progressPercent: number;
  status: ProgressStatus;
  lastOpenedAt: number | null;
  completedAt: number | null;
  xpEarned: number;
}

// ─── Derived / Aggregate types ────────────────────────────────────────────────

export interface SubjectProgressSummary {
  subjectId: string;
  totalPacks: number;
  completedPacks: number;
  inProgressPacks: number;
  progressPercent: number;
  totalXpEarned: number;
}

export interface TopicProgressSummary {
  topicId: string;
  totalPacks: number;
  completedPacks: number;
  progressPercent: number;
}

// Rich subject — CurriculumSubject merged with live progress
export interface EnrichedSubject extends CurriculumSubject {
  totalTopics: number;
  completedTopics: number;
  progressPercent: number;
  isPremium: boolean;     // true if any pack in subject is premium-only
}

// Rich topic — CurriculumTopic merged with live progress
export interface EnrichedTopic extends CurriculumTopic {
  packCount: number;
  completedPacks: number;
  progressPercent: number;
}

// ─── Form Selector ────────────────────────────────────────────────────────────

export interface FormOption {
  id: string;
  label: string;
  order: number;
  subjectCount: number;
}
