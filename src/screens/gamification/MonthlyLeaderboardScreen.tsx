// Monthly leaderboard — reuses WeeklyLeaderboardScreen, which opens on the
// monthly tab when its route name is 'MonthlyLeaderboard' (see that file).
import React from 'react';
import type { StackScreenProps } from '@react-navigation/stack';
import type { HomeStackParamList } from '../../types';
import { WeeklyLeaderboardScreen } from './WeeklyLeaderboardScreen';

type Props = StackScreenProps<HomeStackParamList, 'MonthlyLeaderboard'>;

export function MonthlyLeaderboardScreen({ navigation, route }: Props) {
  return <WeeklyLeaderboardScreen navigation={navigation as any} route={route as any} />;
}
