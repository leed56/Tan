/**
 * Adapters that convert Phase 2 CurriculumXxx types → Phase 1 types.
 * This lets updated screens keep using Phase 1 SubjectCard, LearningPackCard, etc.
 */

import type { Subject, Topic, LearningPack } from '../types';
import type {
  CurriculumSubject,
  CurriculumTopic,
  CurriculumLearningPack,
  SubjectProgressSummary,
  TopicProgressSummary,
} from '../types/curriculum';

export function toSubject(
  cs: CurriculumSubject,
  topicCount = 0,
  progress?: SubjectProgressSummary,
): Subject {
  return {
    id: cs.id,
    name: cs.name,
    iconName: cs.icon,
    color: cs.color,
    gradientColors: cs.gradientColors,
    totalTopics: topicCount,
    completedTopics: progress?.completedPacks ?? 0,
    progressPercent: progress?.progressPercent ?? 0,
    isPremium: !cs.isCore,  // non-core subjects gated behind premium
    form: [1, 2, 3, 4],    // each form has its own copy; presented per-form
  };
}

export function toTopic(
  ct: CurriculumTopic,
  packCount = 0,
  progress?: TopicProgressSummary,
): Topic {
  return {
    id: ct.id,
    subjectId: ct.subjectId,
    title: ct.name,
    description: ct.description,
    packCount,
    completedPacks: progress?.completedPacks ?? 0,
    progressPercent: progress?.progressPercent ?? 0,
    estimatedMinutes: ct.estimatedMinutes,
    form: Number(ct.formId.replace('form_', '')) as 1 | 2 | 3 | 4,
  };
}

export function toLearningPack(cp: CurriculumLearningPack): LearningPack {
  return {
    id: cp.id,
    topicId: cp.topicId,
    subjectId: cp.subjectId,
    title: cp.title,
    description: cp.description,
    type: cp.type,
    questionCount: cp.questionCount,
    xpReward: cp.completionXP,
    isPremium: cp.isPremium,
    isCompleted: false,     // injected from progressStore at render time
    completionPercent: 0,   // injected from progressStore at render time
    estimatedMinutes: cp.estimatedMinutes,
  };
}

/** Inject live progress into a converted LearningPack */
export function withPackProgress(
  pack: LearningPack,
  progressPercent: number,
  isCompleted: boolean,
): LearningPack {
  return { ...pack, completionPercent: progressPercent, isCompleted };
}
