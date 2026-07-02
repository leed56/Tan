import type { StackNavigationOptions } from '@react-navigation/stack';

// On web, @react-navigation/stack's CardSheet switches to an auto-growing
// `minHeight: 100%` page so the browser body can scroll — but Expo's web shell
// keeps `overflow: hidden` on the body, so screens taller than the viewport
// (e.g. subject selection) could neither scroll internally nor reach their
// bottom-anchored CTAs on phones. Forcing the card to flex:1 pins every screen
// to the viewport height so internal ScrollViews/FlatLists scroll normally.
// No-op on native, where cards are already viewport-sized.
export const VIEWPORT_CARD: StackNavigationOptions = {
  cardStyle: { flex: 1 },
};
