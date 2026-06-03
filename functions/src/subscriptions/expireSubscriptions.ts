import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Runs daily at 02:00 UTC to expire lapsed subscriptions
export const expireSubscriptions = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('Africa/Dar_es_Salaam')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();

    const expired = await admin.firestore()
      .collection('users')
      .where('subscriptionStatus', '==', 'active')
      .where('subscriptionExpiry', '<', now)
      .get();

    if (expired.empty) {
      functions.logger.info('No subscriptions to expire');
      return;
    }

    const batch = admin.firestore().batch();
    expired.docs.forEach((doc) => {
      batch.update(doc.ref, {
        subscriptionStatus: 'expired',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    functions.logger.info(`Expired ${expired.size} subscriptions`);
  });
