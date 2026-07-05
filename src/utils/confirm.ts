import { Alert, Platform } from 'react-native';

/**
 * Cross-platform destructive-action confirm. RN-web's Alert ignores buttons
 * (it can only show a bare alert), so the web build uses window.confirm.
 */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void,
): void {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

/**
 * Cross-platform informational alert. RN-web's `Alert.alert` is a silent
 * no-op, so an OK-only Alert never appears in the browser — the web build
 * uses window.alert instead. Native keeps the styled Alert.
 */
export function notify(title: string, message: string, onDismiss?: () => void): void {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined') window.alert(`${title}\n\n${message}`);
    onDismiss?.();
    return;
  }
  Alert.alert(title, message, onDismiss ? [{ text: 'OK', onPress: onDismiss }] : undefined);
}
