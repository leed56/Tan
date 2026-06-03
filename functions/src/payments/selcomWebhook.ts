import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

interface SelcomCallbackPayload {
  reference: string;
  order_id: string;
  msisdn: string;
  msisdn_name: string;
  amount: number;
  currency: string;
  payment_status: 'COMPLETED' | 'FAILED' | 'PENDING';
  transid: string;
  channel: string;
  result_code: string;
  message: string;
}

// Verify HMAC-SHA256 signature from Selcom
function verifySelcomSignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export const selcomWebhook = functions
  .runWith({ secrets: ['SELCOM_API_SECRET'] })
  .https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const signature = req.headers['x-selcom-signature'] as string;
    const secret = process.env.SELCOM_API_SECRET ?? '';
    const rawBody = JSON.stringify(req.body);

    if (!signature || !verifySelcomSignature(rawBody, signature, secret)) {
      functions.logger.warn('Invalid Selcom signature');
      res.status(401).json({ status: 'INVALID_SIGNATURE' });
      return;
    }

    const payload = req.body as SelcomCallbackPayload;
    functions.logger.info('Selcom callback', { orderId: payload.order_id, status: payload.payment_status });

    if (payload.payment_status !== 'COMPLETED') {
      await updatePaymentRequest(payload.order_id, 'failed', payload.message);
      res.status(200).json({ status: 'RECEIVED' });
      return;
    }

    await admin.firestore().runTransaction(async (tx) => {
      const paymentRef = admin.firestore()
        .collection('payment_requests')
        .doc(payload.order_id);
      const paymentDoc = await tx.get(paymentRef);

      if (!paymentDoc.exists) {
        functions.logger.error('Payment request not found', { orderId: payload.order_id });
        return;
      }

      const payment = paymentDoc.data()!;
      if (payment.status !== 'pending') return;

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      tx.update(paymentRef, {
        status: 'verified',
        transactionId: payload.transid,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        verifiedBy: 'selcom_webhook',
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
        provider: 'selcom',
        transactionId: payload.transid,
        amount: payload.amount,
        currency: payload.currency,
        activatedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(expiryDate),
        status: 'active',
      });
    });

    res.status(200).json({ status: 'RECEIVED' });
  });

async function updatePaymentRequest(orderId: string, status: string, reason: string) {
  await admin.firestore()
    .collection('payment_requests')
    .doc(orderId)
    .update({
      status,
      failureReason: reason,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}
