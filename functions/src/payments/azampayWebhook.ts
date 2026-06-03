import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

interface AzampayCallbackPayload {
  msisdn: string;
  amount: string;
  message: string;
  utilityref: string;
  operator: string;
  reference: string;
  transactionstatus: 'SUCCESS' | 'FAILED';
  submerchantAcc?: string;
}

function verifyAzampaySignature(
  payload: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean {
  const message = `${payload}${timestamp}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export const azampayWebhook = functions
  .runWith({ secrets: ['AZAMPAY_APP_SECRET'] })
  .https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;
    const secret = process.env.AZAMPAY_APP_SECRET ?? '';
    const rawBody = JSON.stringify(req.body);

    if (!signature || !timestamp || !verifyAzampaySignature(rawBody, timestamp, signature, secret)) {
      functions.logger.warn('Invalid Azampay signature');
      res.status(401).json({ success: false, message: 'Invalid signature' });
      return;
    }

    const payload = req.body as AzampayCallbackPayload;
    functions.logger.info('Azampay callback', {
      reference: payload.reference,
      status: payload.transactionstatus,
      operator: payload.operator,
    });

    if (payload.transactionstatus !== 'SUCCESS') {
      await admin.firestore()
        .collection('payment_requests')
        .doc(payload.reference)
        .update({
          status: 'failed',
          failureReason: payload.message,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      res.status(200).json({ success: true });
      return;
    }

    await admin.firestore().runTransaction(async (tx) => {
      const paymentRef = admin.firestore()
        .collection('payment_requests')
        .doc(payload.reference);
      const paymentDoc = await tx.get(paymentRef);

      if (!paymentDoc.exists || paymentDoc.data()!.status !== 'pending') return;

      const payment = paymentDoc.data()!;
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      tx.update(paymentRef, {
        status: 'verified',
        transactionId: payload.utilityref,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        verifiedBy: 'azampay_webhook',
      });

      tx.update(admin.firestore().collection('users').doc(payment.userId), {
        subscriptionStatus: 'active',
        subscriptionExpiry: admin.firestore.Timestamp.fromDate(expiryDate),
        subscriptionPlan: payment.planType ?? 'single',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      tx.set(admin.firestore().collection('subscriptions').doc(), {
        userId: payment.userId,
        plan: payment.planType ?? 'single',
        provider: `azampay_${payload.operator.toLowerCase()}`,
        transactionId: payload.utilityref,
        amount: parseFloat(payload.amount),
        currency: 'TZS',
        activatedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(expiryDate),
        status: 'active',
      });
    });

    res.status(200).json({ success: true });
  });
