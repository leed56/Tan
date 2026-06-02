// TODO: Phase 2 — implement Firebase Cloud Messaging (FCM) push notifications
// TODO: Phase 2 — daily study reminder notifications
// TODO: Phase 2 — streak at-risk notifications (haven't studied today)
// TODO: Phase 2 — new content available notifications
// TODO: Phase 2 — leaderboard rank change notifications
// TODO: Phase 2 — request notification permissions on profile creation

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function requestPermission(): Promise<boolean> {
  // TODO: Phase 2 — request expo-notifications permission
  return false;
}

export async function getFcmToken(): Promise<string | null> {
  // TODO: Phase 2 — get FCM token and save to Firestore /users/{uid}/fcmToken
  return null;
}

export async function scheduleDailyReminder(_hour: number, _minute: number): Promise<void> {
  // TODO: Phase 2 — schedule daily push notification via expo-notifications
  throw new Error('Notifications not implemented yet. Coming in Phase 2.');
}

export async function cancelAllNotifications(): Promise<void> {
  // TODO: Phase 2 — cancel all scheduled notifications
}
