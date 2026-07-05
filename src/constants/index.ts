export * from './subjects';

export const APP_NAME = 'Soma';
export const APP_TAGLINE = 'Learn Smarter. Pass NECTA.';

export const XP_PER_LEVEL = 500;
export const XP_PER_CORRECT_ANSWER = 10;
export const XP_PER_PACK_COMPLETION = 50;
export const STREAK_BONUS_XP = 25;

export const AVATARS = [
  { id: 'avatar_1', emoji: '🦁', label: 'Lion' },
  { id: 'avatar_2', emoji: '🦅', label: 'Eagle' },
  { id: 'avatar_3', emoji: '🐘', label: 'Elephant' },
  { id: 'avatar_4', emoji: '🦊', label: 'Fox' },
  { id: 'avatar_5', emoji: '🐆', label: 'Leopard' },
  { id: 'avatar_6', emoji: '🦒', label: 'Giraffe' },
  { id: 'avatar_7', emoji: '🦓', label: 'Zebra' },
  { id: 'avatar_8', emoji: '🐬', label: 'Dolphin' },
] as const;

export const DEMO_LEADERBOARD = [
  { uid: '1', name: 'Amara Diallo', form: 4 as const, school: 'Azania Secondary', xp: 4820, rank: 1, weeklyXp: 340, avatarId: 'avatar_1' as const },
  { uid: '2', name: 'Juma Mwangi', form: 3 as const, school: 'St. Joseph\'s School', xp: 4310, rank: 2, weeklyXp: 290, avatarId: 'avatar_5' as const },
  { uid: '3', name: 'Fatuma Hassan', form: 4 as const, school: 'Kibasila Secondary', xp: 3950, rank: 3, weeklyXp: 260, avatarId: 'avatar_3' as const },
  { uid: '4', name: 'Baraka Otieno', form: 2 as const, school: 'Dar es Salaam Academy', xp: 3620, rank: 4, weeklyXp: 220, avatarId: 'avatar_2' as const },
  { uid: '5', name: 'Neema Kimaro', form: 3 as const, school: 'Mwalimu Nyerere High', xp: 3290, rank: 5, weeklyXp: 195, avatarId: 'avatar_7' as const },
  { uid: '6', name: 'Salim Bakari', form: 1 as const, school: 'Mikocheni Secondary', xp: 3010, rank: 6, weeklyXp: 180, avatarId: 'avatar_4' as const },
  { uid: '7', name: 'Zawadi Msafiri', form: 4 as const, school: 'Tanga Girls School', xp: 2780, rank: 7, weeklyXp: 165, avatarId: 'avatar_6' as const },
  { uid: '8', name: 'Omari Shaban', form: 2 as const, school: 'Arusha Secondary', xp: 2540, rank: 8, weeklyXp: 145, avatarId: 'avatar_8' as const },
];

export const DEMO_BADGES = [
  { id: 'first_lesson', title: 'First Step', description: 'Complete your first lesson', iconName: 'star', isEarned: true, earnedAt: Date.now() - 86400000 },
  { id: 'streak_3', title: '3-Day Streak', description: 'Study 3 days in a row', iconName: 'flame', isEarned: true, earnedAt: Date.now() - 172800000 },
  { id: 'math_master', title: 'Math Wizard', description: 'Score 90%+ in Mathematics', iconName: 'calculator', isEarned: false, earnedAt: null },
  { id: 'streak_7', title: 'Week Warrior', description: 'Study 7 days in a row', iconName: 'trophy', isEarned: false, earnedAt: null },
  { id: 'all_subjects', title: 'Explorer', description: 'Try all 13 subjects', iconName: 'compass', isEarned: false, earnedAt: null },
  { id: 'speed_run', title: 'Speed Runner', description: 'Complete a pack in under 3 mins', iconName: 'flash', isEarned: false, earnedAt: null },
];

export const MOTIVATIONAL_MESSAGES = [
  'Excellent work! Keep pushing! 🔥',
  'You\'re on fire! NECTA awaits! 🏆',
  'Outstanding! You\'re a star student! ⭐',
  'Amazing effort! One step closer to success! 🎯',
  'Brilliant! Your hard work is paying off! 💪',
];
