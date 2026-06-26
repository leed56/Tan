import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { z } from 'zod';

const requestSchema = z.object({
  questionId: z.string().min(1),
  questionText: z.string().min(1).max(2000),
  questionType: z.enum(['MCQ', 'FIB', 'TF', 'HOQ']),
  correctAnswer: z.string().min(1),
  userAnswer: z.string(),
  subject: z.string().min(1).max(100),
  topic: z.string().min(1).max(200),
  form: z.string().min(1).max(50),
  options: z.array(z.string()).optional(),
});

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const EXPLANATION_PROMPT = (data: z.infer<typeof requestSchema>) => `
You are an expert O-Level teacher for Tanzania's national curriculum.
A student answered this question INCORRECTLY and needs a clear, encouraging explanation.

QUESTION CONTEXT:
- Subject: ${data.subject}
- Topic: ${data.topic}
- Form: ${data.form}
- Question Type: ${data.questionType}
- Question: ${data.questionText}
${data.options ? `- Options:\n${data.options.map((o, i) => `  ${String.fromCharCode(65 + i)}. ${o}`).join('\n')}` : ''}
- Correct Answer: ${data.correctAnswer}
- Student's Answer: ${data.userAnswer || '(no answer given)'}

Respond with a JSON object matching EXACTLY this structure (8 required sections):
{
  "simpleExplanation": "2-3 sentences in plain Swahili-friendly English. Start with 'The correct answer is...'",
  "whyCorrect": "2-4 sentences explaining WHY the correct answer is right. Reference specific facts.",
  "whyWrong": "1-3 sentences explaining why the student's answer was incorrect. Be gentle.",
  "keyConceptTitle": "Short title of the core concept (max 6 words)",
  "keyConcept": "3-5 sentences explaining the underlying concept the student must understand.",
  "memoryTip": "A memorable mnemonic, acronym, or story hook to remember this. Max 2 sentences.",
  "examTip": "A specific strategy for similar NECTA exam questions. Reference mark scheme patterns.",
  "relatedTopics": ["topic1", "topic2", "topic3"]
}

CRITICAL RULES:
1. Use simple English appropriate for Form 1-4 Tanzanian students
2. Be encouraging, never condescending
3. All values must be non-empty strings (except relatedTopics which is an array)
4. relatedTopics must have 2-4 items
5. Return ONLY valid JSON, no markdown fences
`;

export const generateExplanation = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '256MB',
    secrets: ['GEMINI_API_KEY'],
  })
  .https.onCall(async (data: unknown, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const uid = context.auth.uid;

    // Verify premium subscription
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found.');
    }
    const userData = userDoc.data()!;
    if (userData.subscriptionStatus !== 'active') {
      throw new functions.https.HttpsError('permission-denied', 'Premium subscription required.');
    }

    // Validate request
    const parseResult = requestSchema.safeParse(data);
    if (!parseResult.success) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid request: ${parseResult.error.message}`
      );
    }
    const payload = parseResult.data;

    // Rate limit: max 20 explanations per day per user (atomic check + reserve)
    const today = new Date().toISOString().split('T')[0];
    const rateLimitRef = admin.firestore()
      .collection('rate_limits')
      .doc(`${uid}_explanations_${today}`);

    await admin.firestore().runTransaction(async (tx) => {
      const doc = await tx.get(rateLimitRef);
      const count = doc.exists ? (doc.data()!.count as number) : 0;
      if (count >= 20) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'Daily explanation limit reached. Try again tomorrow.'
        );
      }
      tx.set(
        rateLimitRef,
        { count: admin.firestore.FieldValue.increment(1), updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    });

    // Check cache — same question + same answer within 24h
    const cacheKey = `${payload.questionId}_${Buffer.from(payload.userAnswer).toString('base64').slice(0, 16)}`;
    const cached = await admin.firestore()
      .collection('ai_explanations')
      .where('cacheKey', '==', cacheKey)
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (!cached.empty) {
      const cachedData = cached.docs[0].data();
      const createdAt: admin.firestore.Timestamp = cachedData.createdAt;
      const ageMs = Date.now() - createdAt.toMillis();
      if (ageMs < 24 * 60 * 60 * 1000) {
        return { explanation: cachedData.explanation, cached: true };
      }
    }

    // Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new functions.https.HttpsError('internal', 'API key not configured.');
    }

    let explanation: Record<string, unknown>;
    try {
      const response = await axios.post(
        `${GEMINI_ENDPOINT}?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: EXPLANATION_PROMPT(payload) }] }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1500,
            responseMimeType: 'application/json',
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        },
        { timeout: 30000 }
      );

      const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
      explanation = JSON.parse(raw);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      functions.logger.error('Gemini API error:', err);
      throw new functions.https.HttpsError('internal', `AI service error: ${message}`);
    }

    // Validate required sections
    const requiredSections = [
      'simpleExplanation', 'whyCorrect', 'whyWrong',
      'keyConceptTitle', 'keyConcept', 'memoryTip', 'examTip', 'relatedTopics',
    ];
    const missing = requiredSections.filter(s => !explanation[s]);
    if (missing.length > 0) {
      throw new functions.https.HttpsError('internal', `Incomplete AI response: missing ${missing.join(', ')}`);
    }

    // Persist explanation
    const explanationDoc = {
      userId: uid,
      questionId: payload.questionId,
      cacheKey,
      explanation,
      subject: payload.subject,
      topic: payload.topic,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const savedRef = await admin.firestore().collection('ai_explanations').add(explanationDoc);

    functions.logger.info('Explanation generated', { uid, questionId: payload.questionId, docId: savedRef.id });

    return { explanation, cached: false };
  });
