import { useAppThemeStore } from '../store/appThemeStore';
import { COLORS, GRADIENTS } from '../theme';

export function useTheme() {
  const { isDark, toggle, setDark } = useAppThemeStore();

  return {
    isDark,
    toggle,
    setDark,
    colors: COLORS,
    gradients: GRADIENTS,
  };
}
