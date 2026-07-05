/**
 * Legal copy for the in-app Privacy Policy and Terms of Service screens.
 * Plain, student-and-parent readable. Update EFFECTIVE_DATE and SUPPORT_EMAIL
 * if they change; the screens render these sections verbatim.
 */
export const LEGAL_EFFECTIVE_DATE = 'July 2026';
export const LEGAL_SUPPORT_EMAIL = 'support@somaaiedu.com';

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDoc {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export const PRIVACY_POLICY: LegalDoc = {
  title: 'Privacy Policy',
  intro:
    `Soma ("we", "us") helps Tanzanian Form 1–4 students prepare for NECTA exams. ` +
    `This policy explains what information we collect, how we use it, and the choices you have. ` +
    `Effective ${LEGAL_EFFECTIVE_DATE}.`,
  sections: [
    {
      heading: '1. Information we collect',
      body:
        'When you sign in with Google, we receive your name, email address, and profile photo from your Google account. ' +
        'You also give us your Form level and, optionally, your school name. As you study, we store your quiz progress, ' +
        'XP, streaks, badges, and daily usage so your learning is saved across sessions.',
    },
    {
      heading: '2. How we use your information',
      body:
        'We use your information only to run the app: to save your progress, show your place on leaderboards, apply your ' +
        'subscription, enforce fair daily limits, and provide support. We do not sell your personal data to anyone.',
    },
    {
      heading: '3. Where your data is stored',
      body:
        'Your data is stored securely using Google Firebase (authentication and database). Access is restricted by security ' +
        'rules so that only you — and, where necessary, our support team — can read your personal records.',
    },
    {
      heading: '4. Payments and support',
      body:
        'Subscription upgrades are arranged through WhatsApp with our support team. When you contact us, WhatsApp and your ' +
        'mobile network handle your message under their own privacy terms. We only use the details you share to activate ' +
        'and support your subscription.',
    },
    {
      heading: '5. Children and parental consent',
      body:
        'Soma is intended for secondary-school students. If you are under 18, a parent or guardian should review this ' +
        'policy and agree to it on your behalf. Parents may contact us at any time to review or remove their child’s data.',
    },
    {
      heading: '6. Your rights and data deletion',
      body:
        'You can edit your profile at any time. You can permanently delete your account and associated data from ' +
        'Settings → Delete Account. Deleting your account removes your Google sign-in link and your saved learning data ' +
        'from the app.',
    },
    {
      heading: '7. Changes to this policy',
      body:
        'We may update this policy as the app grows. Significant changes will be reflected here with a new effective date.',
    },
    {
      heading: '8. Contact us',
      body: `Questions about your privacy? Email ${LEGAL_SUPPORT_EMAIL} or reach us on WhatsApp from Settings → Support.`,
    },
  ],
};

export const TERMS_OF_SERVICE: LegalDoc = {
  title: 'Terms of Service',
  intro:
    `These terms govern your use of Soma. By creating an account and using the app, you agree to them. ` +
    `Effective ${LEGAL_EFFECTIVE_DATE}.`,
  sections: [
    {
      heading: '1. Your account',
      body:
        'You sign in with your Google account and are responsible for keeping it secure. Provide accurate details (such as ' +
        'your Form level) so the app can serve you the right content. Each account is limited to a set number of devices ' +
        'per your plan.',
    },
    {
      heading: '2. Acceptable use',
      body:
        'Use Soma for your own personal study. Do not attempt to copy, resell, or redistribute the questions, ' +
        'explanations, or other content, and do not try to bypass subscription or usage limits.',
    },
    {
      heading: '3. Subscriptions and payments',
      body:
        'Free accounts include a daily allowance of quizzes. Premium and Family plans unlock more. Upgrades are arranged ' +
        'via WhatsApp and mobile money; our team activates your subscription after payment is confirmed. Prices are shown ' +
        'in Tanzanian Shillings (TSH).',
    },
    {
      heading: '4. Family profiles',
      body:
        'The Family plan lets one paying account add student profiles that share the subscription. Each profile keeps its ' +
        'own progress. The account owner is responsible for the profiles they create.',
    },
    {
      heading: '5. Educational content',
      body:
        'Our content is aligned to the NECTA O-Level curriculum and prepared with care, but we cannot guarantee any ' +
        'particular exam result. Soma is a study aid, not a substitute for your school and teachers.',
    },
    {
      heading: '6. Cancellation and termination',
      body:
        'You may stop using the app or delete your account at any time from Settings. We may suspend accounts that misuse ' +
        'the service or breach these terms.',
    },
    {
      heading: '7. Changes to these terms',
      body:
        'We may update these terms as the app evolves. Continued use after an update means you accept the revised terms.',
    },
    {
      heading: '8. Contact and governing law',
      body:
        `These terms are governed by the laws of the United Republic of Tanzania. For any questions, contact ` +
        `${LEGAL_SUPPORT_EMAIL}.`,
    },
  ],
};
