/**
 * Seed script — Tanzania O-Level curriculum data
 * Usage: node scripts/seed-data.mjs
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, setDoc, addDoc, serverTimestamp, getDocs, query, limit,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA9NxggtzrTbs24_5gwwbqKwxFHPa9EV4k',
  authDomain: 'tanzania-81c27.firebaseapp.com',
  projectId: 'tanzania-81c27',
  storageBucket: 'tanzania-81c27.firebasestorage.app',
  messagingSenderId: '970279243429',
  appId: '1:970279243429:web:c1f7a6e6c7b4e5b8f1a2c3',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── helpers ──────────────────────────────────────────────────────────────────

async function upsert(collectionName, id, data) {
  await setDoc(doc(db, collectionName, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  console.log(`  ✓ ${collectionName}/${id}`);
}

async function add(collectionName, data) {
  const ref = await addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  console.log(`  ✓ ${collectionName}/${ref.id}`);
  return ref.id;
}

// ── subjects ─────────────────────────────────────────────────────────────────

console.log('\n📚 Seeding subjects...');
await upsert('subjects', 'math', { name: 'Mathematics', code: 'MATH', icon: '🔢', color: '#7B6FF2', order: 1 });
await upsert('subjects', 'biology', { name: 'Biology', code: 'BIO', icon: '🧬', color: '#4CAF50', order: 2 });
await upsert('subjects', 'chemistry', { name: 'Chemistry', code: 'CHEM', icon: '⚗️', color: '#FF9800', order: 3 });
await upsert('subjects', 'physics', { name: 'Physics', code: 'PHY', icon: '⚡', color: '#2196F3', order: 4 });
await upsert('subjects', 'english', { name: 'English', code: 'ENG', icon: '📖', color: '#E91E63', order: 5 });
await upsert('subjects', 'history', { name: 'History', code: 'HIST', icon: '🏛️', color: '#795548', order: 6 });
await upsert('subjects', 'geography', { name: 'Geography', code: 'GEO', icon: '🌍', color: '#009688', order: 7 });
await upsert('subjects', 'kiswahili', { name: 'Kiswahili', code: 'KIS', icon: '🇹🇿', color: '#FF5722', order: 8 });

// ── forms ─────────────────────────────────────────────────────────────────────

console.log('\n🏫 Seeding forms...');
await upsert('forms', 'form_1', { name: 'Form 1', level: 1, description: 'First year of secondary school' });
await upsert('forms', 'form_2', { name: 'Form 2', level: 2, description: 'Second year of secondary school' });
await upsert('forms', 'form_3', { name: 'Form 3', level: 3, description: 'Third year of secondary school' });
await upsert('forms', 'form_4', { name: 'Form 4', level: 4, description: 'Final O-Level year (NECTA)' });

// ── topics ────────────────────────────────────────────────────────────────────

console.log('\n📋 Seeding topics...');
// Math
await upsert('topics', 'math_algebra', { subjectId: 'math', name: 'Algebra', order: 1 });
await upsert('topics', 'math_geometry', { subjectId: 'math', name: 'Geometry', order: 2 });
await upsert('topics', 'math_fractions', { subjectId: 'math', name: 'Fractions & Decimals', order: 3 });
await upsert('topics', 'math_statistics', { subjectId: 'math', name: 'Statistics', order: 4 });
// Biology
await upsert('topics', 'bio_cells', { subjectId: 'biology', name: 'Cell Biology', order: 1 });
await upsert('topics', 'bio_photosynthesis', { subjectId: 'biology', name: 'Photosynthesis', order: 2 });
await upsert('topics', 'bio_genetics', { subjectId: 'biology', name: 'Genetics & Heredity', order: 3 });
await upsert('topics', 'bio_ecology', { subjectId: 'biology', name: 'Ecology', order: 4 });
// Chemistry
await upsert('topics', 'chem_periodic', { subjectId: 'chemistry', name: 'Periodic Table', order: 1 });
await upsert('topics', 'chem_bonding', { subjectId: 'chemistry', name: 'Chemical Bonding', order: 2 });
await upsert('topics', 'chem_acids', { subjectId: 'chemistry', name: 'Acids, Bases & Salts', order: 3 });

// ── subscription plans ────────────────────────────────────────────────────────

console.log('\n💳 Seeding subscription plans...');
await upsert('subscription_plans', 'free', {
  name: 'Free', price: 0, currency: 'TZS',
  features: ['10 questions/day', 'Basic quiz mode', 'Leaderboard'],
  questionLimit: 10, aiExplanations: false, isPopular: false,
});
await upsert('subscription_plans', 'monthly', {
  name: 'Monthly', price: 5000, currency: 'TZS',
  features: ['Unlimited questions', 'AI explanations', 'All subjects', 'Offline mode', 'Leaderboard'],
  questionLimit: -1, aiExplanations: true, isPopular: true, durationDays: 30,
});
await upsert('subscription_plans', 'termly', {
  name: 'Termly', price: 12000, currency: 'TZS',
  features: ['Unlimited questions', 'AI explanations', 'All subjects', 'Offline mode', 'Priority support'],
  questionLimit: -1, aiExplanations: true, isPopular: false, durationDays: 90,
});

// ── learning packs ────────────────────────────────────────────────────────────

console.log('\n📦 Seeding learning packs...');
const packId1 = await add('learning_packs', {
  title: 'Mathematics Form 1 Starter',
  subjectId: 'math', formId: 'form_1', topicId: 'math_algebra',
  description: 'Master the basics of algebra for Form 1 NECTA prep',
  questionCount: 20, difficulty: 'easy', xpReward: 100,
  isFree: true, isPremium: false, order: 1,
});
const packId2 = await add('learning_packs', {
  title: 'Biology — Cell Biology',
  subjectId: 'biology', formId: 'form_2', topicId: 'bio_cells',
  description: 'Understand cell structure, function, and division',
  questionCount: 25, difficulty: 'medium', xpReward: 150,
  isFree: false, isPremium: true, order: 1,
});
const packId3 = await add('learning_packs', {
  title: 'Chemistry — Acids, Bases & Salts',
  subjectId: 'chemistry', formId: 'form_3', topicId: 'chem_acids',
  description: 'Core NECTA topic — pH, indicators, neutralisation',
  questionCount: 30, difficulty: 'hard', xpReward: 200,
  isFree: false, isPremium: true, order: 1,
});

// ── sample questions ──────────────────────────────────────────────────────────

console.log('\n❓ Seeding sample questions...');

const mathQuestions = [
  {
    questionText: 'Solve for x: 2x + 6 = 14',
    type: 'mcq', difficulty: 'easy', correctAnswer: 'b',
    options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
    explanation: 'Subtract 6 from both sides: 2x = 8. Divide by 2: x = 4.',
    xpReward: 10, packId: packId1, subjectId: 'math', topicId: 'math_algebra',
    formId: 'form_1', hasLatex: false,
  },
  {
    questionText: 'What is the value of 5² + 3²?',
    type: 'mcq', difficulty: 'easy', correctAnswer: 'c',
    options: ['25', '30', '34', '16'],
    explanation: '5² = 25 and 3² = 9. So 25 + 9 = 34.',
    xpReward: 10, packId: packId1, subjectId: 'math', topicId: 'math_algebra',
    formId: 'form_1', hasLatex: false,
  },
  {
    questionText: 'Simplify: 3a + 2b − a + 4b',
    type: 'fib', difficulty: 'easy', correctAnswer: '2a + 6b',
    options: [],
    explanation: 'Collect like terms: (3a − a) + (2b + 4b) = 2a + 6b.',
    xpReward: 15, packId: packId1, subjectId: 'math', topicId: 'math_algebra',
    formId: 'form_1', hasLatex: false,
  },
  {
    questionText: 'The sum of angles in a triangle is 180°.',
    type: 'tf', difficulty: 'easy', correctAnswer: 'true',
    options: [],
    explanation: 'The interior angles of any triangle always add up to exactly 180°.',
    xpReward: 5, packId: packId1, subjectId: 'math', topicId: 'math_geometry',
    formId: 'form_1', hasLatex: false,
  },
  {
    questionText: 'If a = 3 and b = 4, what is the value of a² + b²?',
    type: 'mcq', difficulty: 'medium', correctAnswer: 'a',
    options: ['25', '49', '7', '12'],
    explanation: 'a² = 9, b² = 16. So 9 + 16 = 25. This is also the Pythagorean theorem: c² = a² + b².',
    xpReward: 10, packId: packId1, subjectId: 'math', topicId: 'math_algebra',
    formId: 'form_1', hasLatex: false,
  },
];

const bioQuestions = [
  {
    questionText: 'What is the powerhouse of the cell?',
    type: 'mcq', difficulty: 'easy', correctAnswer: 'b',
    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Vacuole'],
    explanation: 'Mitochondria produce ATP through cellular respiration, earning them the title "powerhouse of the cell".',
    xpReward: 10, packId: packId2, subjectId: 'biology', topicId: 'bio_cells',
    formId: 'form_2', hasLatex: false,
  },
  {
    questionText: 'Cells with a nucleus are called _______ cells.',
    type: 'fib', difficulty: 'easy', correctAnswer: 'eukaryotic',
    options: [],
    explanation: 'Eukaryotic cells have a membrane-bound nucleus. Prokaryotic cells do not have a nucleus.',
    xpReward: 15, packId: packId2, subjectId: 'biology', topicId: 'bio_cells',
    formId: 'form_2', hasLatex: false,
  },
  {
    questionText: 'Bacteria are examples of prokaryotic cells.',
    type: 'tf', difficulty: 'easy', correctAnswer: 'true',
    options: [],
    explanation: 'Bacteria lack a membrane-bound nucleus, so they are prokaryotes. Animals and plants are eukaryotes.',
    xpReward: 5, packId: packId2, subjectId: 'biology', topicId: 'bio_cells',
    formId: 'form_2', hasLatex: false,
  },
  {
    questionText: 'During photosynthesis, plants use sunlight to convert CO₂ and water into:',
    type: 'mcq', difficulty: 'medium', correctAnswer: 'a',
    options: ['Glucose and oxygen', 'Carbon dioxide and water', 'Starch and nitrogen', 'ATP and ADP'],
    explanation: '6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. Plants produce glucose (food) and release oxygen.',
    xpReward: 10, packId: packId2, subjectId: 'biology', topicId: 'bio_photosynthesis',
    formId: 'form_2', hasLatex: false,
  },
];

const chemQuestions = [
  {
    questionText: 'What is the pH of a neutral solution?',
    type: 'mcq', difficulty: 'easy', correctAnswer: 'b',
    options: ['0', '7', '14', '1'],
    explanation: 'pH 7 is neutral. Below 7 is acidic, above 7 is alkaline. Pure water has pH 7.',
    xpReward: 10, packId: packId3, subjectId: 'chemistry', topicId: 'chem_acids',
    formId: 'form_3', hasLatex: false,
  },
  {
    questionText: 'An acid turns blue litmus paper ______.',
    type: 'fib', difficulty: 'easy', correctAnswer: 'red',
    options: [],
    explanation: 'Acids turn blue litmus red and red litmus stays red. Bases turn red litmus blue.',
    xpReward: 15, packId: packId3, subjectId: 'chemistry', topicId: 'chem_acids',
    formId: 'form_3', hasLatex: false,
  },
  {
    questionText: 'Neutralisation produces a salt and water.',
    type: 'tf', difficulty: 'easy', correctAnswer: 'true',
    options: [],
    explanation: 'Acid + Base → Salt + Water. Example: HCl + NaOH → NaCl + H₂O.',
    xpReward: 5, packId: packId3, subjectId: 'chemistry', topicId: 'chem_acids',
    formId: 'form_3', hasLatex: false,
  },
  {
    questionText: 'What is the chemical formula of sulfuric acid?',
    type: 'mcq', difficulty: 'medium', correctAnswer: 'c',
    options: ['HCl', 'HNO₃', 'H₂SO₄', 'H₃PO₄'],
    explanation: 'Sulfuric acid is H₂SO₄ — a strong diprotic acid used widely in industry and car batteries.',
    xpReward: 10, packId: packId3, subjectId: 'chemistry', topicId: 'chem_acids',
    formId: 'form_3', hasLatex: false,
  },
];

for (const q of [...mathQuestions, ...bioQuestions, ...chemQuestions]) {
  await add('questions', q);
}

// ── gamification defaults ─────────────────────────────────────────────────────

console.log('\n🎮 Seeding gamification config...');
await upsert('settings', 'gamification', {
  xpPerCorrectAnswer: 10,
  xpPerWrongAnswer: 2,
  xpStreakBonus: 5,
  coinsPerLevel: 50,
  streakFreezePrice: 100,
  dailyMissionXP: 50,
  levels: [
    { level: 1, minXP: 0, title: 'Beginner' },
    { level: 2, minXP: 100, title: 'Student' },
    { level: 3, minXP: 300, title: 'Scholar' },
    { level: 4, minXP: 600, title: 'Expert' },
    { level: 5, minXP: 1000, title: 'Master' },
  ],
});

console.log('\n✅ Seed complete!');
console.log('   Subjects: 8 | Forms: 4 | Topics: 11 | Plans: 3 | Packs: 3 | Questions: 13');
process.exit(0);
