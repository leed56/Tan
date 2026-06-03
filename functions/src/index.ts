import * as admin from 'firebase-admin';

admin.initializeApp();

export { generateExplanation } from './explanations/generateExplanation';
export { selcomWebhook } from './payments/selcomWebhook';
export { azampayWebhook } from './payments/azampayWebhook';
export { expireSubscriptions } from './subscriptions/expireSubscriptions';
