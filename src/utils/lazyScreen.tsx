/**
 * Lazy-load React Native screens to reduce initial JS bundle parse time.
 * Usage: const MyScreen = lazyScreen(() => import('../screens/MyScreen'));
 */

import React, { Suspense, lazy, ComponentType } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme';

function ScreenFallback(): React.ReactElement {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgDark, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyScreen<P extends Record<string, any>>(
  factory: () => Promise<{ default: ComponentType<P> }>
): ComponentType<P> {
  const LazyComponent = lazy(factory);

  const Wrapped = LazyComponent as unknown as ComponentType<Record<string, unknown>>;
  const LazyWrapper: ComponentType<P> = (props: P) => (
    <Suspense fallback={<ScreenFallback />}>
      <Wrapped {...(props as Record<string, unknown>)} />
    </Suspense>
  );

  return LazyWrapper;
}
