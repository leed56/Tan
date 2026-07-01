import { useWindowDimensions } from 'react-native';

// Design baseline used when spacing/typography tokens and fixed decorative
// sizes (rings, hero icons) were authored. Scale is clamped to a small-phone
// floor and an iPhone Pro Max ceiling so nothing shrinks/grows unboundedly.
const BASE_WIDTH = 375;
const MIN_WIDTH = 320;
const MAX_WIDTH = 430;

// Reactive (uses useWindowDimensions, not a load-time Dimensions.get snapshot)
// width ratio for scaling decorative graphical elements. Do NOT use this for
// the spacing/typography token scale — that consistency is intentional.
export function useResponsiveScale(): number {
  const { width } = useWindowDimensions();
  const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
  return clamped / BASE_WIDTH;
}

// Scales `size` by `scale`, softened by `factor` (0 = no scaling, 1 = fully
// linear) so a graphic grows/shrinks gently rather than 1:1 with the screen.
export function moderateScale(size: number, scale: number, factor = 0.5): number {
  return Math.round(size + (size * scale - size) * factor);
}
