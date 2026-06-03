export type XPSource =
  | 'mcq_correct' | 'fib_correct' | 'tf_correct'
  | 'quiz_complete' | 'pack_complete'
  | 'daily_mission' | 'streak_bonus' | 'streak_milestone'
  | 'review_explanation';

export type CoinSource =
  | 'correct_answer' | 'quiz_complete' | 'pack_complete'
  | 'daily_mission' | 'streak_milestone';

export type BadgeId =
  | 'first_quiz' | 'first_perfect' | 'streak_3' | 'streak_7'
  | 'math_starter' | 'science_explorer' | 'fast_learner'
  | 'comeback' | 'form1_champion' | 'premium_learner';

export type MissionType = 'questions_answered' | 'quizzes_completed' | 'xp_earned_today';

export interface GamificationProfile {
  uid: string;
  xp: number;
  level: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;  // YYYY-MM-DD
  totalQuizzes: number;
  totalCorrect: number;
  totalQuestions: number;
  updatedAt: number;
}

export interface XPLog {
  id: string;
  userId: string;
  amount: number;
  source: XPSource;
  sourceId: string | null;
  createdAt: number;
}

export interface CoinLog {
  id: string;
  userId: string;
  amount: number;
  source: CoinSource;
  sourceId: string | null;
  createdAt: number;
}

export interface BadgeDefinition {
  id: BadgeId;
  title: string;
  description: string;
  iconName: string;
  requirement: string;
  rarity: 'common' | 'rare' | 'epic';
  color: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: BadgeId;
  earnedAt: number;
}

export interface DailyMissionDef {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  targetCount: number;
  xpReward: number;
  coinsReward: number;
  iconName: string;
}

export interface UserDailyMission {
  id: string;
  userId: string;
  missionId: string;
  date: string;          // YYYY-MM-DD
  progress: number;
  isCompleted: boolean;
  claimedAt: number | null;
}

export interface LeaderboardScore {
  id: string;
  userId: string;
  name: string;
  avatarId: string;
  form: number;
  school: string;
  totalXp: number;
  weeklyXp: number;
  monthlyXp: number;
  rank: number;
  rankChange: number;    // positive = moved up, negative = moved down
}

export interface RewardBox {
  id: string;
  label: string;
  coinsMin: number;
  coinsMax: number;
  xpBonus: number;
  rarity: 'common' | 'rare' | 'epic';
  isAvailable: boolean;
}

// XP amounts per action
export const XP_REWARDS: Record<XPSource, number> = {
  mcq_correct: 10,
  fib_correct: 12,
  tf_correct: 8,
  quiz_complete: 25,
  pack_complete: 100,
  daily_mission: 50,
  streak_bonus: 20,
  streak_milestone: 20,
  review_explanation: 5,
};

export const COIN_REWARDS: Record<CoinSource, number> = {
  correct_answer: 1,
  quiz_complete: 5,
  pack_complete: 20,
  daily_mission: 10,
  streak_milestone: 25,
};

export const STREAK_MILESTONES = [3, 7, 14, 30];

// Level XP thresholds
export const LEVEL_THRESHOLDS: number[] = (() => {
  const base = [0, 100, 250, 500, 900];
  for (let n = 5; n < 50; n++) {
    base.push(Math.floor(900 * Math.pow(1.6, n - 4)));
  }
  return base;
})();
