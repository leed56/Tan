/**
 * Tanzania O-Level Curriculum Seed Data — Phase 2
 * Real topic names aligned with NECTA syllabus Form 1–4.
 * Used as local fallback when Firestore is unavailable.
 */

import type {
  CurriculumForm,
  CurriculumSubject,
  CurriculumTopic,
  CurriculumLearningPack,
} from '../types/curriculum';

const NOW = Date.now();

// ─── Forms ────────────────────────────────────────────────────────────────────

export const SEED_FORMS: CurriculumForm[] = [
  { id: 'form_1', name: 'Form 1', order: 1, isActive: true, createdAt: NOW, updatedAt: NOW },
  { id: 'form_2', name: 'Form 2', order: 2, isActive: true, createdAt: NOW, updatedAt: NOW },
  { id: 'form_3', name: 'Form 3', order: 3, isActive: true, createdAt: NOW, updatedAt: NOW },
  { id: 'form_4', name: 'Form 4', order: 4, isActive: true, createdAt: NOW, updatedAt: NOW },
];

// ─── Subject meta (shared across forms) ───────────────────────────────────────

interface SubjectMeta {
  key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradientColors: string[];
  isCore: boolean;
}

const SUBJECT_META: SubjectMeta[] = [
  {
    key: 'mathematics',
    name: 'Mathematics',
    description: 'Numbers, algebra, geometry and statistics for O-Level NECTA.',
    icon: 'calculator',
    color: '#4ECDC4',
    gradientColors: ['#4ECDC4', '#2EAF9F'],
    isCore: true,
  },
  {
    key: 'english',
    name: 'English Language',
    description: 'Grammar, comprehension, essay writing and literature.',
    icon: 'book',
    color: '#4A90D9',
    gradientColors: ['#4A90D9', '#2E6FB0'],
    isCore: true,
  },
  {
    key: 'kiswahili',
    name: 'Kiswahili',
    description: 'Sarufi, fasihi, insha na mazungumzo ya Kiswahili.',
    icon: 'chatbubbles',
    color: '#FF8C42',
    gradientColors: ['#FF8C42', '#E06B28'],
    isCore: true,
  },
  {
    key: 'biology',
    name: 'Biology',
    description: 'Life sciences covering cells, ecology, genetics and human physiology.',
    icon: 'leaf',
    color: '#52C41A',
    gradientColors: ['#52C41A', '#389E0D'],
    isCore: true,
  },
  {
    key: 'chemistry',
    name: 'Chemistry',
    description: 'Atomic structure, chemical reactions, organic and industrial chemistry.',
    icon: 'flask',
    color: '#7B6FF2',
    gradientColors: ['#7B6FF2', '#5A50CC'],
    isCore: false,
  },
  {
    key: 'physics',
    name: 'Physics',
    description: 'Mechanics, energy, electricity, waves and modern physics.',
    icon: 'planet',
    color: '#5C6BC0',
    gradientColors: ['#5C6BC0', '#3949AB'],
    isCore: false,
  },
  {
    key: 'geography',
    name: 'Geography',
    description: 'Physical and human geography, maps, climate and Tanzania landscapes.',
    icon: 'globe',
    color: '#10B981',
    gradientColors: ['#10B981', '#059669'],
    isCore: true,
  },
  {
    key: 'history',
    name: 'History',
    description: 'African history, colonialism, independence and post-independence era.',
    icon: 'time',
    color: '#F59E0B',
    gradientColors: ['#F59E0B', '#D97706'],
    isCore: true,
  },
  {
    key: 'civics',
    name: 'Civics',
    description: 'Constitution, governance, human rights and civic responsibilities.',
    icon: 'people',
    color: '#06B6D4',
    gradientColors: ['#06B6D4', '#0891B2'],
    isCore: true,
  },
  {
    key: 'commerce',
    name: 'Commerce',
    description: 'Trade, business documents, banking, insurance and entrepreneurship.',
    icon: 'trending-up',
    color: '#EC4899',
    gradientColors: ['#EC4899', '#DB2777'],
    isCore: false,
  },
  {
    key: 'agriculture',
    name: 'Agriculture',
    description: 'Soil science, crop production, animal husbandry and farm management.',
    icon: 'flower',
    color: '#84CC16',
    gradientColors: ['#84CC16', '#65A30D'],
    isCore: false,
  },
  {
    key: 'computer_studies',
    name: 'Computer Studies',
    description: 'Hardware, software, programming basics, internet and databases.',
    icon: 'laptop',
    color: '#8B5CF6',
    gradientColors: ['#8B5CF6', '#7C3AED'],
    isCore: false,
  },
  {
    key: 'islamic_knowledge',
    name: 'Islamic Knowledge',
    description: 'Pillars of Islam, Quran, Hadith, Fiqh and Islamic civilizations.',
    icon: 'star',
    color: '#F7C52E',
    gradientColors: ['#F7C52E', '#D4A017'],
    isCore: false,
  },
];

// ─── Topics per subject per form ──────────────────────────────────────────────

interface TopicDef {
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
}

const TOPICS_BY_SUBJECT_FORM: Record<string, Record<string, TopicDef[]>> = {
  mathematics: {
    form_1: [
      { name: 'Numbers and Numeration', description: 'Natural numbers, integers, place value and number systems', difficulty: 'easy', estimatedMinutes: 40 },
      { name: 'Fractions and Decimals', description: 'Operations with fractions, decimals and percentages', difficulty: 'easy', estimatedMinutes: 45 },
      { name: 'Introduction to Algebra', description: 'Variables, expressions and simple equations', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Geometry Basics', description: 'Points, lines, angles and basic shapes', difficulty: 'easy', estimatedMinutes: 40 },
    ],
    form_2: [
      { name: 'Linear Equations and Inequalities', description: 'Solving linear equations, simultaneous equations and inequalities', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Geometry — Areas and Perimeters', description: 'Calculating areas, perimeters and volumes of common shapes', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Statistics and Data Handling', description: 'Mean, median, mode, frequency tables and bar charts', difficulty: 'easy', estimatedMinutes: 45 },
      { name: 'Indices and Surds', description: 'Laws of indices, surds and standard form', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_3: [
      { name: 'Quadratic Equations', description: 'Factorisation, completing the square and the quadratic formula', difficulty: 'hard', estimatedMinutes: 60 },
      { name: 'Trigonometry', description: 'Sine, cosine, tangent and solving triangles', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Coordinate Geometry', description: 'Straight line, gradient, midpoint and distance formula', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Probability', description: 'Sample space, theoretical and experimental probability', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_4: [
      { name: 'Functions and Graphs', description: 'Domain, range, composite and inverse functions', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Sequences and Series', description: 'Arithmetic and geometric progressions and their sums', difficulty: 'hard', estimatedMinutes: 60 },
      { name: 'Calculus Introduction', description: 'Limits, differentiation and basic integration', difficulty: 'hard', estimatedMinutes: 70 },
      { name: 'NECTA Mathematics Revision', description: 'Past paper analysis, exam techniques and timed practice', difficulty: 'hard', estimatedMinutes: 90 },
    ],
  },
  english: {
    form_1: [
      { name: 'Grammar Fundamentals', description: 'Parts of speech, sentence structure and punctuation', difficulty: 'easy', estimatedMinutes: 40 },
      { name: 'Reading Comprehension', description: 'Strategies for reading passages and answering questions', difficulty: 'easy', estimatedMinutes: 45 },
      { name: 'Composition Writing', description: 'Narrative, descriptive and letter writing skills', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_2: [
      { name: 'Advanced Grammar', description: 'Tenses, reported speech, active and passive voice', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Essay Writing Techniques', description: 'Argumentative and expository essays with proper structure', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Literature: Prose', description: 'Analysing characters, themes and style in prose texts', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_3: [
      { name: 'Summary Writing', description: 'Identifying key points and writing concise summaries', difficulty: 'medium', estimatedMinutes: 45 },
      { name: 'Literature: Drama and Poetry', description: 'Dramatic techniques, poetic devices and critical analysis', difficulty: 'hard', estimatedMinutes: 55 },
      { name: 'Oral Communication', description: 'Listening, speaking, interview skills and presentations', difficulty: 'medium', estimatedMinutes: 40 },
    ],
    form_4: [
      { name: 'Advanced Writing Skills', description: 'Reports, formal letters and argumentative essays', difficulty: 'hard', estimatedMinutes: 60 },
      { name: 'Critical Text Analysis', description: 'Deep analysis of literary texts across genres', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'NECTA English Paper Revision', description: 'Past paper drills and examiner tips for all sections', difficulty: 'hard', estimatedMinutes: 90 },
    ],
  },
  kiswahili: {
    form_1: [
      { name: 'Sarufi ya Kiswahili', description: 'Vipande vya hotuba, miundo ya sentensi na tahajia', difficulty: 'easy', estimatedMinutes: 40 },
      { name: 'Hadithi na Masimulizi', description: 'Kusoma na kuelewa hadithi za Kiswahili', difficulty: 'easy', estimatedMinutes: 45 },
      { name: 'Insha na Uandishi', description: 'Kuandika insha za masimulizi na maelezo', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_2: [
      { name: 'Lugha na Matumizi Yake', description: 'Matumizi ya lugha katika mazingira tofauti', difficulty: 'medium', estimatedMinutes: 45 },
      { name: 'Fasihi ya Kiswahili', description: 'Uchambuzi wa riwaya, ushairi na tamthiliya', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Uandishi wa Barua na Ripoti', description: 'Kuandika barua rasmi, barua pepe na ripoti', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_3: [
      { name: 'Fasihi Simulizi', description: 'Ngano, methali, vitendawili na nyimbo za utamaduni', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Uchanganuzi wa Tungo', description: 'Kuchunguza muundo na dhamira katika tungo', difficulty: 'hard', estimatedMinutes: 55 },
      { name: 'Mazungumzo na Mjadala', description: 'Mbinu za mazungumzo, mdahalo na uwasilishaji', difficulty: 'medium', estimatedMinutes: 45 },
    ],
    form_4: [
      { name: 'Fasihi ya Kina', description: 'Uchambuzi wa kina wa kazi za fasihi za Kiswahili', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Utunzi wa Insha za Kina', description: 'Insha za hoja, za maelezo na tathmini', difficulty: 'hard', estimatedMinutes: 60 },
      { name: 'Marudio ya NECTA Kiswahili', description: 'Maswali ya mitihani ya zamani na mbinu za kufanya mtihani', difficulty: 'hard', estimatedMinutes: 90 },
    ],
  },
  biology: {
    form_1: [
      { name: 'Introduction to Biology', description: 'Scope of biology, scientific method and laboratory safety', difficulty: 'easy', estimatedMinutes: 35 },
      { name: 'Cell Structure and Organisation', description: 'Cell theory, organelles, plant vs animal cells', difficulty: 'easy', estimatedMinutes: 45 },
      { name: 'Classification of Living Things', description: 'Five kingdoms, binomial nomenclature and dichotomous keys', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_2: [
      { name: 'Nutrition in Plants and Animals', description: 'Photosynthesis, mineral nutrition and human digestive system', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Transport in Living Organisms', description: 'Osmosis, diffusion and circulatory system', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Reproduction', description: 'Sexual and asexual reproduction, human reproduction', difficulty: 'medium', estimatedMinutes: 60 },
    ],
    form_3: [
      { name: 'Genetics and Heredity', description: 'Mendelian genetics, DNA structure and mutation', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Ecology and the Environment', description: 'Food chains, ecosystems, energy flow and conservation', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Biotechnology', description: 'Genetic engineering, fermentation and applications', difficulty: 'hard', estimatedMinutes: 60 },
    ],
    form_4: [
      { name: 'Human Physiology', description: 'Nervous system, hormones, excretion and homeostasis', difficulty: 'hard', estimatedMinutes: 70 },
      { name: 'Coordination and Response', description: 'Sense organs, reflexes and plant responses', difficulty: 'hard', estimatedMinutes: 60 },
      { name: 'NECTA Biology Revision', description: 'Past paper practice and examination techniques', difficulty: 'hard', estimatedMinutes: 90 },
    ],
  },
  chemistry: {
    form_1: [
      { name: 'Introduction to Chemistry', description: 'Lab safety, scientific method and basic equipment', difficulty: 'easy', estimatedMinutes: 35 },
      { name: 'Matter and Its Properties', description: 'States of matter, mixtures, elements and compounds', difficulty: 'easy', estimatedMinutes: 45 },
      { name: 'Atomic Structure', description: 'Protons, neutrons, electrons and electronic configuration', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_2: [
      { name: 'Chemical Bonding', description: 'Ionic, covalent and metallic bonding', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Acids, Bases and Salts', description: 'pH scale, neutralisation and salt preparation', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'The Periodic Table', description: 'Groups, periods, periodicity and trends', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_3: [
      { name: 'Chemical Reactions and Equations', description: 'Balancing equations, reaction types and rates', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Organic Chemistry Basics', description: 'Hydrocarbons, functional groups and nomenclature', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Electrochemistry', description: 'Electrolysis, galvanic cells and corrosion', difficulty: 'hard', estimatedMinutes: 60 },
    ],
    form_4: [
      { name: 'Industrial Chemistry', description: 'Haber process, contact process and industrial applications', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Advanced Organic Chemistry', description: 'Alcohols, carboxylic acids, esters and polymers', difficulty: 'hard', estimatedMinutes: 70 },
      { name: 'NECTA Chemistry Revision', description: 'Past paper analysis, practical skills and exam tips', difficulty: 'hard', estimatedMinutes: 90 },
    ],
  },
  physics: {
    form_1: [
      { name: 'Measurement and SI Units', description: 'SI units, measuring instruments and scientific notation', difficulty: 'easy', estimatedMinutes: 40 },
      { name: 'Forces and Motion', description: 'Newton\'s laws, speed, velocity and acceleration', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Matter and Its Properties', description: 'Density, pressure in solids, liquids and gases', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_2: [
      { name: 'Energy, Work and Power', description: 'Forms of energy, conservation, work-energy theorem', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Thermal Physics', description: 'Heat transfer, thermometers and change of state', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Light and Optics', description: 'Reflection, refraction, lenses and optical instruments', difficulty: 'medium', estimatedMinutes: 55 },
    ],
    form_3: [
      { name: 'Waves and Sound', description: 'Wave properties, sound waves and the Doppler effect', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Electricity and Magnetism', description: 'Static electricity, circuits, Ohm\'s law and magnetism', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Turning Effect of Forces', description: 'Moments, equilibrium, machines and levers', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_4: [
      { name: 'Electronics', description: 'Semiconductors, diodes, transistors and logic gates', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Nuclear Physics', description: 'Radioactivity, nuclear reactions and applications', difficulty: 'hard', estimatedMinutes: 60 },
      { name: 'NECTA Physics Revision', description: 'Past paper practice, practical skills and exam techniques', difficulty: 'hard', estimatedMinutes: 90 },
    ],
  },
  geography: {
    form_1: [
      { name: 'Introduction to Geography', description: 'Branches of geography, the solar system and Earth', difficulty: 'easy', estimatedMinutes: 35 },
      { name: 'Maps and Map Reading', description: 'Scale, contours, relief and map symbols', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Atmosphere and Weather', description: 'Elements of weather, instruments and climate types', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_2: [
      { name: 'Rocks and Weathering', description: 'Rock types, weathering processes and soil formation', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Agriculture and Land Use', description: 'Types of farming, crops and land use in Tanzania', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Population and Settlement', description: 'Population distribution, growth and urbanisation', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_3: [
      { name: 'Water Bodies and Rivers', description: 'Rivers, lakes, ocean currents and drainage systems', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Natural Resources of Tanzania', description: 'Minerals, forests, wildlife and tourism', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Environmental Management', description: 'Pollution, conservation and sustainable development', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_4: [
      { name: 'Regional Geography of Africa', description: 'Physical features, climate zones and human geography of Africa', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Tanzania Geography In Depth', description: 'Detailed study of Tanzania\'s regions, economy and development', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'NECTA Geography Revision', description: 'Map skills, essay questions and past paper practice', difficulty: 'hard', estimatedMinutes: 90 },
    ],
  },
  history: {
    form_1: [
      { name: 'Introduction to History', description: 'Sources of history, importance and early African societies', difficulty: 'easy', estimatedMinutes: 35 },
      { name: 'Early African Civilizations', description: 'Egypt, Great Zimbabwe, Swahili Coast civilizations', difficulty: 'easy', estimatedMinutes: 45 },
      { name: 'Trans-Saharan and Indian Ocean Trade', description: 'Trade routes, commodities and impact on East Africa', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_2: [
      { name: 'Colonialism in Africa', description: 'Causes, scramble, partition and establishment of colonies', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Resistance to Colonial Rule', description: 'African resistance movements and Maji Maji rebellion', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'The Two World Wars', description: 'Causes, events and effects of WWI and WWII on Africa', difficulty: 'medium', estimatedMinutes: 55 },
    ],
    form_3: [
      { name: 'Nationalism and Independence', description: 'Rise of nationalism, political parties and independence movements', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Post-Independence Africa', description: 'Challenges of independence, pan-Africanism and OAU/AU', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Cold War and Africa', description: 'Superpower rivalry, proxy conflicts and decolonisation', difficulty: 'hard', estimatedMinutes: 60 },
    ],
    form_4: [
      { name: 'Tanzania After Independence', description: 'Ujamaa, Arusha Declaration, multipartyism and development', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Modern African History', description: 'Apartheid, Rwanda genocide, democratisation', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'NECTA History Revision', description: 'Essay techniques, source analysis and past paper practice', difficulty: 'hard', estimatedMinutes: 90 },
    ],
  },
  civics: {
    form_1: [
      { name: 'Introduction to Civics', description: 'Meaning of civics, citizenship and civic responsibility', difficulty: 'easy', estimatedMinutes: 35 },
      { name: 'The Constitution of Tanzania', description: 'Structure, principles and importance of the constitution', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Human Rights and Freedoms', description: 'Universal human rights, children\'s rights and duties', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_2: [
      { name: 'Democratic Governance', description: 'Democracy, elections, separation of powers and rule of law', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Local Government in Tanzania', description: 'Structure, functions and financing of local government', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'National Development', description: 'Development goals, five-year plans and national identity', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_3: [
      { name: 'International Relations', description: 'Foreign policy, diplomacy, EAC, AU and United Nations', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Social Issues in Tanzania', description: 'Corruption, gender equality, HIV/AIDS and poverty', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Environmental Citizenship', description: 'Environmental rights, conservation and citizen action', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_4: [
      { name: 'Contemporary Issues', description: 'Globalisation, information technology and Tanzania\'s role', difficulty: 'hard', estimatedMinutes: 60 },
      { name: 'Conflict Resolution and Peace', description: 'Types of conflict, negotiation and peacebuilding', difficulty: 'hard', estimatedMinutes: 55 },
      { name: 'NECTA Civics Revision', description: 'Essay questions, case studies and past paper practice', difficulty: 'hard', estimatedMinutes: 90 },
    ],
  },
  commerce: {
    form_1: [
      { name: 'Introduction to Commerce', description: 'Scope of commerce, production chain and trade', difficulty: 'easy', estimatedMinutes: 35 },
      { name: 'Retail and Wholesale Trade', description: 'Types of traders, channels of distribution and markets', difficulty: 'easy', estimatedMinutes: 45 },
      { name: 'Banking and Financial Services', description: 'Types of banks, accounts and banking services', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_2: [
      { name: 'Business Documents', description: 'Invoices, receipts, orders, statements and cheques', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Insurance and Risk Management', description: 'Principles of insurance, types and importance', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Transport and Communication', description: 'Modes of transport, communication and their role in commerce', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_3: [
      { name: 'Advertising and Marketing', description: 'Advertising media, sales promotion and marketing mix', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Finance and Credit', description: 'Sources of finance, credit, hire purchase and leasing', difficulty: 'hard', estimatedMinutes: 60 },
      { name: 'International Trade', description: 'Imports, exports, balance of payments and trade agreements', difficulty: 'hard', estimatedMinutes: 60 },
    ],
    form_4: [
      { name: 'Entrepreneurship', description: 'Business planning, SWOT analysis and startup finance', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Cooperative Societies', description: 'Types, principles and role of cooperatives in Tanzania', difficulty: 'hard', estimatedMinutes: 55 },
      { name: 'NECTA Commerce Revision', description: 'Past paper practice and examiner report analysis', difficulty: 'hard', estimatedMinutes: 90 },
    ],
  },
  agriculture: {
    form_1: [
      { name: 'Introduction to Agriculture', description: 'Importance of agriculture, farming systems and inputs', difficulty: 'easy', estimatedMinutes: 35 },
      { name: 'Soil Science', description: 'Soil formation, types, properties and conservation', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Crop Production Basics', description: 'Seed selection, planting, weeding and harvesting', difficulty: 'easy', estimatedMinutes: 45 },
    ],
    form_2: [
      { name: 'Animal Husbandry', description: 'Livestock rearing, breeds, feeding and disease control', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Pest and Disease Management', description: 'Identification, prevention and control of crop pests', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Farm Tools and Mechanisation', description: 'Types of tools, implements and farm machinery', difficulty: 'easy', estimatedMinutes: 45 },
    ],
    form_3: [
      { name: 'Agricultural Economics', description: 'Farm planning, costs, budgeting and profit analysis', difficulty: 'hard', estimatedMinutes: 60 },
      { name: 'Irrigation and Water Management', description: 'Types of irrigation, water harvesting and conservation', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Agroforestry and Land Management', description: 'Tree-crop integration, land tenure and reclamation', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_4: [
      { name: 'Modern Farming Technologies', description: 'Greenhouse, hydroponics, GMOs and precision agriculture', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Agricultural Marketing', description: 'Value chains, cooperatives and market linkages', difficulty: 'hard', estimatedMinutes: 60 },
      { name: 'NECTA Agriculture Revision', description: 'Practical skills, theory review and past paper questions', difficulty: 'hard', estimatedMinutes: 90 },
    ],
  },
  computer_studies: {
    form_1: [
      { name: 'Introduction to Computers', description: 'Definition, history, types and uses of computers', difficulty: 'easy', estimatedMinutes: 35 },
      { name: 'Computer Hardware', description: 'Input, output, storage devices and the CPU', difficulty: 'easy', estimatedMinutes: 45 },
      { name: 'Operating Systems', description: 'Functions of OS, Windows basics and file management', difficulty: 'medium', estimatedMinutes: 50 },
    ],
    form_2: [
      { name: 'Word Processing', description: 'Microsoft Word — formatting, tables and mail merge', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Spreadsheets', description: 'Microsoft Excel — formulas, functions and charts', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Internet and Email', description: 'Browsers, search engines, email and online safety', difficulty: 'easy', estimatedMinutes: 45 },
    ],
    form_3: [
      { name: 'Database Management', description: 'MS Access — tables, queries, forms and reports', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Programming Basics', description: 'Algorithms, flowcharts and introduction to Python', difficulty: 'hard', estimatedMinutes: 70 },
      { name: 'Networks and Cybersecurity', description: 'LAN, WAN, protocols and basic security concepts', difficulty: 'hard', estimatedMinutes: 60 },
    ],
    form_4: [
      { name: 'Advanced Programming', description: 'Variables, loops, functions and simple programs in Python', difficulty: 'hard', estimatedMinutes: 75 },
      { name: 'Web Development Basics', description: 'HTML, CSS and creating simple web pages', difficulty: 'hard', estimatedMinutes: 70 },
      { name: 'NECTA Computer Studies Revision', description: 'Theory, practical mock exams and past paper analysis', difficulty: 'hard', estimatedMinutes: 90 },
    ],
  },
  islamic_knowledge: {
    form_1: [
      { name: 'Pillars of Islam (Arkan al-Islam)', description: 'Shahada, Salat, Zakat, Sawm and Hajj in depth', difficulty: 'easy', estimatedMinutes: 40 },
      { name: 'Quran Recitation and Tajweed', description: 'Rules of recitation, selected Suras and memorisation', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Islamic History: Early Period', description: 'Life of Prophet Muhammad (SAW), companions and early caliphate', difficulty: 'easy', estimatedMinutes: 45 },
    ],
    form_2: [
      { name: 'Fiqh — Ibadah', description: 'Rules of purity, prayer, fasting and pilgrimage', difficulty: 'medium', estimatedMinutes: 55 },
      { name: 'Hadith Studies', description: 'Selected Hadiths, their classification and applications', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Tafsir — Selected Verses', description: 'Interpretation of selected Quranic verses and their lessons', difficulty: 'medium', estimatedMinutes: 55 },
    ],
    form_3: [
      { name: 'Fiqh — Muamalat (Transactions)', description: 'Islamic finance, contracts, marriage and inheritance', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Islamic Ethics and Morality', description: 'Akhlaq, social obligations and Islamic work ethic', difficulty: 'medium', estimatedMinutes: 50 },
      { name: 'Islamic Civilizations', description: 'Golden Age of Islam, scholars and contributions to science', difficulty: 'medium', estimatedMinutes: 55 },
    ],
    form_4: [
      { name: 'Advanced Tafsir', description: 'In-depth interpretation of major Suras with contemporary relevance', difficulty: 'hard', estimatedMinutes: 65 },
      { name: 'Contemporary Islamic Issues', description: 'Bioethics, media, environment and Islam in modern Tanzania', difficulty: 'hard', estimatedMinutes: 60 },
      { name: 'NECTA Islamic Knowledge Revision', description: 'Essay writing, source analysis and past paper practice', difficulty: 'hard', estimatedMinutes: 90 },
    ],
  },
};

// ─── Pack templates per topic ─────────────────────────────────────────────────

interface PackTemplate {
  titleSuffix: string;
  type: CurriculumLearningPack['type'];
  description: string;
  questionCount: number;
  estimatedMinutes: number;
  isPremium: boolean;
  xpMultiplier: number; // completionXP = baseDifficulty * multiplier
}

const PACK_TEMPLATES: PackTemplate[] = [
  {
    titleSuffix: 'MCQ Quiz',
    type: 'mcq',
    description: 'Test your knowledge with multiple choice questions. Instant AI feedback on every answer.',
    questionCount: 10,
    estimatedMinutes: 12,
    isPremium: false,
    xpMultiplier: 1.0,
  },
  {
    titleSuffix: 'True or False',
    type: 'tf',
    description: 'Quickly verify key facts and correct common misconceptions.',
    questionCount: 12,
    estimatedMinutes: 8,
    isPremium: false,
    xpMultiplier: 0.7,
  },
  {
    titleSuffix: 'Fill in the Blanks',
    type: 'fib',
    description: 'Complete sentences using the correct terms — builds active recall.',
    questionCount: 8,
    estimatedMinutes: 10,
    isPremium: false,
    xpMultiplier: 0.9,
  },
  {
    titleSuffix: 'Summary',
    type: 'summary',
    description: '10 key points covering the core concepts, exam tips and mnemonics.',
    questionCount: 0,
    estimatedMinutes: 5,
    isPremium: true,
    xpMultiplier: 0.4,
  },
  {
    titleSuffix: 'Higher Order Questions',
    type: 'hoq',
    description: 'NECTA-style structured and essay questions requiring deep analysis and extended writing.',
    questionCount: 5,
    estimatedMinutes: 30,
    isPremium: true,
    xpMultiplier: 2.0,
  },
];

const DIFFICULTY_BASE_XP = { easy: 30, medium: 50, hard: 70 };

// ─── Generator functions ──────────────────────────────────────────────────────

export function buildSeedSubjects(): CurriculumSubject[] {
  const subjects: CurriculumSubject[] = [];
  for (const form of SEED_FORMS) {
    SUBJECT_META.forEach((meta, order) => {
      subjects.push({
        id: `${form.id}_${meta.key}`,
        formId: form.id,
        name: meta.name,
        description: meta.description,
        icon: meta.icon,
        color: meta.color,
        gradientColors: meta.gradientColors,
        order: order + 1,
        isCore: meta.isCore,
        isActive: true,
        createdAt: NOW,
        updatedAt: NOW,
      });
    });
  }
  return subjects;
}

export function buildSeedTopics(): CurriculumTopic[] {
  const topics: CurriculumTopic[] = [];
  for (const form of SEED_FORMS) {
    for (const meta of SUBJECT_META) {
      const subjectId = `${form.id}_${meta.key}`;
      const defs = TOPICS_BY_SUBJECT_FORM[meta.key]?.[form.id] ?? [];
      defs.forEach((def, order) => {
        topics.push({
          id: `${subjectId}_topic_${order + 1}`,
          formId: form.id,
          subjectId,
          name: def.name,
          description: def.description,
          order: order + 1,
          difficulty: def.difficulty,
          estimatedMinutes: def.estimatedMinutes,
          isActive: true,
          createdAt: NOW,
          updatedAt: NOW,
        });
      });
    }
  }
  return topics;
}

export function buildSeedLearningPacks(): CurriculumLearningPack[] {
  const packs: CurriculumLearningPack[] = [];
  const topics = buildSeedTopics();
  for (const topic of topics) {
    const baseXP = DIFFICULTY_BASE_XP[topic.difficulty];
    PACK_TEMPLATES.forEach((tmpl, order) => {
      packs.push({
        id: `${topic.id}_pack_${order + 1}`,
        formId: topic.formId,
        subjectId: topic.subjectId,
        topicId: topic.id,
        title: `${topic.name} — ${tmpl.titleSuffix}`,
        description: tmpl.description,
        type: tmpl.type,
        order: order + 1,
        estimatedMinutes: tmpl.estimatedMinutes,
        difficulty: topic.difficulty,
        questionCount: tmpl.questionCount,
        isPremium: tmpl.isPremium,
        isActive: true,
        completionXP: Math.round(baseXP * tmpl.xpMultiplier),
        createdAt: NOW,
        updatedAt: NOW,
      });
    });
  }
  return packs;
}

// Lazy-evaluated singletons (avoids rebuilding on every import)
let _subjects: CurriculumSubject[] | null = null;
let _topics: CurriculumTopic[] | null = null;
let _packs: CurriculumLearningPack[] | null = null;

export function getSeedSubjects(): CurriculumSubject[] {
  if (!_subjects) _subjects = buildSeedSubjects();
  return _subjects;
}

export function getSeedTopics(): CurriculumTopic[] {
  if (!_topics) _topics = buildSeedTopics();
  return _topics;
}

export function getSeedLearningPacks(): CurriculumLearningPack[] {
  if (!_packs) _packs = buildSeedLearningPacks();
  return _packs;
}
