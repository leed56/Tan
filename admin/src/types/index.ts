export type AdminRole = 'super_admin' | 'content_editor' | 'viewer';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

export interface Form { id: string; name: string; code: string; displayOrder: number; }

export interface Subject {
  id: string;
  formId: string;
  name: string;
  code: string;
  color: string;
  icon: string;
  isPremium: boolean;
  displayOrder: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  formId: string;
  name: string;
  displayOrder: number;
  packCount?: number;
}

export interface LearningPack {
  id: string;
  topicId: string;
  subjectId: string;
  formId: string;
  title: string;
  description: string;
  isPremium: boolean;
  questionCount: number;
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  displayOrder: number;
}

export interface Question {
  id: string;
  packId: string;
  topicId: string;
  subjectId: string;
  formId: string;
  type: 'mcq' | 'fib' | 'tf' | 'hoq';
  questionText: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  hasLatex: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  // Written by the app's userService as `phoneNumber` (there is no `phone`).
  phoneNumber: string;
  displayName: string;
  email?: string;
  formId: string;
  schoolName?: string;
  createdAt: Date;
  lastActiveAt?: Date;
  totalXp: number;
  currentStreak: number;
  // Canonical subscription state — matches firestore.rules' isPremium() check
  // and what the client reads off users/{uid}. 'family'/'premium' are legacy
  // values from before the pricing redesign and are treated as 'active'.
  subscriptionStatus: 'free' | 'active' | 'premium' | 'family';
  subscriptionPlan?: 'standard' | 'family';
  subscriptionExpiry?: Date;
  isSuspended: boolean;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  studentPhone: string | null;
  planId: 'standard' | 'family';
  billingCycle: 'monthly' | 'yearly';
  provider: string;
  amount: number;
  transactionRef: string | null;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface AppSettings {
  id: string;
  maxDailyMcq: number;
  maxDailyFib: number;
  maxDailyTf: number;
  singlePlanPriceTzs: number;
  familyPlanPriceTzs: number;
  singlePlanDurationDays: number;
  familyPlanDurationDays: number;
  maxFamilyMembers: number;
  geminiApiEnabled: boolean;
  maintenanceMode: boolean;
  updatedAt: Date;
  updatedBy: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  targetType: 'all' | 'premium' | 'free' | 'specific';
  targetIds?: string[];
  sentAt: Date;
  sentBy: string;
  deliveredCount: number;
}

export interface DashboardStats {
  totalStudents: number;
  activeToday: number;
  premiumStudents: number;
  pendingPayments: number;
  totalQuestions: number;
  totalRevenueTzs: number;
  newStudentsThisWeek: number;
  avgDailyActive: number;
}
