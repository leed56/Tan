import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { z } from 'zod';

const requestSchema = z.object({
  userId: z.string().min(1),
  planId: z.string().min(1),
  amount: z.number().positive(),
  msisdn: z.string().min(9).max(15),
  operator: z.enum(['Airtel', 'Tigo', 'Halopesa', 'Azampesa']),
});

interface AzampayTokenResponse {
  data: { accessToken: string };
  success: boolean;
}

interface AzampayCheckoutResponse {
  transactionId: string;
  message: string;
  success: boolean;
  redirectUrl?: string;
}

export const initiateAzampayPayment = functions
  .runWith({ secrets: ['AZAMPAY_APP_NAME', 'AZAMPAY_CLIENT_ID', 'AZAMPAY_CLIENT_SECRET'] })
  .https.onCall(async (data: unknown, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const parseResult = requestSchema.safeParse(data);
    if (!parseResult.success) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid request: ${parseResult.error.message}`
      );
    }

    const params = parseResult.data;
    if (params.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'userId mismatch.');
    }

    const appName = process.env.AZAMPAY_APP_NAME ?? '';
    const clientId = process.env.AZAMPAY_CLIENT_ID ?? '';
    const clientSecret = process.env.AZAMPAY_CLIENT_SECRET ?? '';

    if (!appName || !clientId || !clientSecret) {
      throw new functions.https.HttpsError('internal', 'Azampay not configured.');
    }

    // Exchange credentials for access token
    const tokenRes = await fetch(
      'https://authenticator.azampay.co.tz/AppRegistration/GenerateToken',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName, clientId, clientSecret }),
      }
    );
    if (!tokenRes.ok) {
      throw new functions.https.HttpsError('internal', `Azampay auth error: ${tokenRes.status}`);
    }
    const tokenData: AzampayTokenResponse = await tokenRes.json();
    if (!tokenData.success) {
      throw new functions.https.HttpsError('internal', 'Azampay authentication failed.');
    }
    const token = tokenData.data.accessToken;

    const reference = `SOMA${Date.now()}`;

    const checkoutRes = await fetch(
      'https://checkout.azampay.co.tz/azampay/mno/checkout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountNumber: params.msisdn,
          additionalProperties: { userId: params.userId, planId: params.planId },
          amount: String(params.amount),
          currency: 'TZS',
          externalId: reference,
          provider: params.operator,
        }),
      }
    );

    if (!checkoutRes.ok) {
      throw new functions.https.HttpsError('internal', `Azampay checkout error: ${checkoutRes.status}`);
    }

    const checkoutData: AzampayCheckoutResponse = await checkoutRes.json();
    if (!checkoutData.success) {
      throw new functions.https.HttpsError('internal', `Azampay: ${checkoutData.message}`);
    }

    await admin.firestore().collection('payment_requests').add({
      userId: params.userId,
      planId: params.planId,
      planType: params.planId,
      provider: 'azampay',
      amount: params.amount,
      phoneNumber: params.msisdn,
      status: 'pending',
      orderId: reference,
      referenceCode: checkoutData.transactionId,
      operator: params.operator,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      orderId: reference,
      reference: checkoutData.transactionId,
      paymentUrl: checkoutData.redirectUrl ?? '',
      provider: 'azampay',
    };
  });
