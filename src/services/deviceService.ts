/**
 * Device-limit enforcement — Standard plan: 2 devices, Family plan: 5 devices.
 * Registered under `users/{uid}/devices/{deviceId}` (owner-scoped subcollection,
 * so the existing `isOwner()` rule pattern covers it with no new admin logic).
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  deleteDoc,
  setDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firestore, COLLECTIONS } from './firebaseConfig';
import type { RegisteredDevice } from '../types/subscription';

function isFirebaseConfigured(): boolean {
  return (process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '').length > 0;
}

const DEVICE_ID_KEY = 'soma-device-id';

function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = generateId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

export function deviceLabel(): string {
  if (Platform.OS === 'ios') return 'iPhone / iPad';
  if (Platform.OS === 'android') return 'Android device';
  return 'Web browser';
}

function devicesRef(userId: string) {
  return collection(firestore, COLLECTIONS.users, userId, COLLECTIONS.devices);
}

/**
 * Registers the current device if under the plan's limit, or refreshes its
 * `lastActiveAt` if already registered. Returns `{ blocked: true }` when the
 * device isn't registered and the account is already at its device cap — the
 * caller should route to ManageDevicesScreen so the user can free up a slot.
 */
export async function registerDevice(
  userId: string,
  maxDevices: number,
): Promise<{ blocked: boolean }> {
  if (!isFirebaseConfigured()) return { blocked: false };
  const deviceId = await getOrCreateDeviceId();
  try {
    const snap = await getDocs(devicesRef(userId));
    const alreadyRegistered = snap.docs.some((d) => d.id === deviceId);
    if (!alreadyRegistered && snap.size >= maxDevices) {
      return { blocked: true };
    }
    await setDoc(
      doc(devicesRef(userId), deviceId),
      {
        userId,
        deviceName: deviceLabel(),
        platform: Platform.OS,
        lastActiveAt: serverTimestamp(),
        ...(alreadyRegistered ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true },
    );
    return { blocked: false };
  } catch {
    return { blocked: false };
  }
}

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number') return value;
  return Date.now();
}

export function subscribeToDevices(
  userId: string,
  callback: (devices: RegisteredDevice[]) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    callback([]);
    return () => {};
  }
  return onSnapshot(
    devicesRef(userId),
    (snap) =>
      callback(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            ...data,
            id: d.id,
            lastActiveAt: toMillis(data.lastActiveAt),
            createdAt: toMillis(data.createdAt),
          } as RegisteredDevice;
        }),
      ),
    () => callback([]),
  );
}

export async function removeDevice(userId: string, deviceId: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await deleteDoc(doc(devicesRef(userId), deviceId)).catch(() => {});
}

export async function getCurrentDeviceId(): Promise<string> {
  return getOrCreateDeviceId();
}
