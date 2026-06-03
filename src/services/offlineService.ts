/**
 * Offline support:
 * 1. Firestore persistent disk cache (enabled in firebaseConfig.ts)
 * 2. NetInfo connectivity monitoring
 * 3. Queue for writes that must be replayed when back online
 *
 * Install: expo install @react-native-community/netinfo @react-native-async-storage/async-storage
 */

import { enableNetwork, disableNetwork, doc, collection, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { firestore } from './firebaseConfig';

const OFFLINE_QUEUE_KEY = 'soma_offline_queue';

export type QueuedWrite = {
  id: string;
  collection: string;
  docId: string | null;
  data: Record<string, unknown>;
  operation: 'set' | 'update' | 'add';
  timestamp: number;
  retries: number;
};

interface AsyncStorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

interface NetInfoStateLike {
  isConnected: boolean | null;
}

interface NetInfoLike {
  fetch(): Promise<NetInfoStateLike>;
  addEventListener(listener: (state: NetInfoStateLike) => void): () => void;
}

function getAsyncStorage(): AsyncStorageLike | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require('@react-native-async-storage/async-storage');
    return m.default ?? m;
  } catch {
    return null;
  }
}

function getNetInfo(): NetInfoLike | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require('@react-native-community/netinfo');
    return m.default ?? m;
  } catch {
    return null;
  }
}

// ─── connectivity state ───────────────────────────────────────────────────────

type NetInfoHandler = (isConnected: boolean) => void;
const listeners: NetInfoHandler[] = [];
let currentlyOnline = true;

export function addConnectivityListener(handler: NetInfoHandler): () => void {
  listeners.push(handler);
  return () => {
    const idx = listeners.indexOf(handler);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function isOnline(): boolean {
  return currentlyOnline;
}

async function notifyListeners(isConnected: boolean): Promise<void> {
  currentlyOnline = isConnected;

  if (isConnected) {
    try { await enableNetwork(firestore); } catch { /* ignore */ }
    await flushOfflineQueue();
  } else {
    try { await disableNetwork(firestore); } catch { /* ignore */ }
  }

  listeners.forEach((fn) => fn(isConnected));
}

export async function initOfflineSupport(): Promise<void> {
  const netInfo = getNetInfo();
  if (!netInfo) {
    currentlyOnline = true;
    return;
  }

  const state = await netInfo.fetch();
  currentlyOnline = state.isConnected ?? true;

  netInfo.addEventListener((s) => {
    const connected = s.isConnected ?? false;
    if (connected !== currentlyOnline) {
      notifyListeners(connected).catch(() => {});
    }
  });
}

// ─── Offline write queue ──────────────────────────────────────────────────────

export async function enqueueWrite(write: Omit<QueuedWrite, 'id' | 'timestamp' | 'retries'>): Promise<void> {
  const queue = await getQueue();
  const entry: QueuedWrite = {
    ...write,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    retries: 0,
  };
  queue.push(entry);
  await saveQueue(queue);
}

async function getQueue(): Promise<QueuedWrite[]> {
  const AsyncStorage = getAsyncStorage();
  if (!AsyncStorage) return [];
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedWrite[]) : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: QueuedWrite[]): Promise<void> {
  const AsyncStorage = getAsyncStorage();
  if (!AsyncStorage) return;
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

async function flushOfflineQueue(): Promise<void> {
  const queue = await getQueue();
  if (queue.length === 0) return;

  const remaining: QueuedWrite[] = [];

  for (const entry of queue) {
    try {
      if (entry.operation === 'set' && entry.docId) {
        await setDoc(doc(firestore, entry.collection, entry.docId), entry.data, { merge: true });
      } else if (entry.operation === 'update' && entry.docId) {
        await updateDoc(doc(firestore, entry.collection, entry.docId), entry.data);
      } else if (entry.operation === 'add') {
        await addDoc(collection(firestore, entry.collection), entry.data);
      }
    } catch {
      if (entry.retries < 3) {
        remaining.push({ ...entry, retries: entry.retries + 1 });
      }
    }
  }

  await saveQueue(remaining);
}

export async function getQueueLength(): Promise<number> {
  return (await getQueue()).length;
}

export async function clearOfflineQueue(): Promise<void> {
  const AsyncStorage = getAsyncStorage();
  if (!AsyncStorage) return;
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
}
