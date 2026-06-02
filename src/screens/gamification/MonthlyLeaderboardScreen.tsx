// Monthly leaderboard — reuses WeeklyLeaderboardScreen with monthly tab pre-selected
import React, { useEffect } from 'react';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { useLeaderboardStore } from '../../store/leaderboardStore';
import { WeeklyLeaderboardScreen } from './WeeklyLeaderboardScreen';

type Props = StackScreenProps<HomeStackParamList, 'MonthlyLeaderboard'>;

export function MonthlyLeaderboardScreen({ navigation, route }: Props) {
  const { setTab } = useLeaderboardStore();
  useEffect(() => { setTab('monthly'); }, [setTab]);
  // Delegate to WeeklyLeaderboardScreen (which supports all tabs)
  return <WeeklyLeaderboardScreen navigation={navigation as any} route={route as any} />;
}
