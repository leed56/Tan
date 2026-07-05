import { Platform, Linking } from 'react-native';

/**
 * Support / WhatsApp contact config.
 *
 * The number is baked in as a default so the WhatsApp buttons work out of the
 * box, and can still be overridden per-environment via
 * EXPO_PUBLIC_SUPPORT_WHATSAPP_NUMBER. Digits only — wa.me format, no '+'.
 */
export const SUPPORT_WHATSAPP_NUMBER =
  process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP_NUMBER ?? '94714938118';

export const SUPPORT_EMAIL = 'support@somaaiedu.com';

/**
 * Open a WhatsApp chat, optionally pre-filled with a message. Uses window.open
 * on web (reliable new tab; RN-web's Linking can be blocked) and Linking on
 * native.
 */
export function openWhatsApp(message?: string): void {
  const base = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`;
  const url = message ? `${base}?text=${encodeURIComponent(message)}` : base;
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  Linking.openURL(url).catch(() => {});
}
