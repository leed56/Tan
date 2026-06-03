/**
 * Drop-in replacement for FlatList that uses FlashList when available.
 * Install: expo install @shopify/flash-list
 * Falls back to FlatList in Expo Go (where native modules may not load).
 */

import React from 'react';
import { FlatList, FlatListProps, View, Text } from 'react-native';

type FlashListProps<T> = {
  estimatedItemSize: number;
} & FlatListProps<T>;

// Lazy-load FlashList to avoid crashes in Expo Go
let FlashListComponent: React.ComponentType<FlashListProps<unknown>> | null = null;
let flashListLoaded = false;

function loadFlashList() {
  if (flashListLoaded) return;
  flashListLoaded = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { FlashList } = require('@shopify/flash-list');
    FlashListComponent = FlashList;
  } catch {
    FlashListComponent = null;
  }
}

// Pre-load on module import
loadFlashList();

export function SomaFlashList<T>({
  estimatedItemSize = 80,
  ...props
}: FlashListProps<T>): React.ReactElement {
  if (FlashListComponent) {
    const FL = FlashListComponent as React.ComponentType<FlashListProps<T>>;
    return <FL estimatedItemSize={estimatedItemSize} {...props} />;
  }
  // FlatList fallback — drop estimatedItemSize which FlatList doesn't accept
  return <FlatList {...props} />;
}

// ─── Empty state placeholder ──────────────────────────────────────────────────

export function ListEmptyState({
  message,
  icon,
}: {
  message: string;
  icon?: string;
}): React.ReactElement {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
      {icon ? <Text style={{ fontSize: 48, marginBottom: 12 }}>{icon}</Text> : null}
      <Text style={{ color: '#7B8DB7', fontSize: 15, textAlign: 'center' }}>{message}</Text>
    </View>
  );
}
