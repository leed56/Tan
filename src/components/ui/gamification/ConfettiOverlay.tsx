import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';

const { width, height } = Dimensions.get('window');

const COLORS_LIST = ['#F7C52E', '#7B6FF2', '#4ECDC4', '#FF6B6B', '#FFA94D', '#74C0FC'];
const COUNT = 30;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

const PARTICLES = Array.from({ length: COUNT }, (_, i) => ({
  id: i,
  x: randomBetween(0, width),
  size: randomBetween(6, 14),
  color: COLORS_LIST[i % COLORS_LIST.length],
  delay: randomBetween(0, 400),
  duration: randomBetween(800, 1600),
  targetY: randomBetween(height * 0.4, height * 0.9),
  rotate: randomBetween(0, 360),
}));

interface Props {
  visible: boolean;
}

export function ConfettiOverlay({ visible }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {PARTICLES.map((p) => (
        <MotiView
          key={p.id}
          from={{ translateY: -30, opacity: 1, rotate: '0deg' }}
          animate={{ translateY: p.targetY, opacity: 0, rotate: `${p.rotate}deg` }}
          transition={{ type: 'timing', duration: p.duration, delay: p.delay }}
          style={[
            styles.particle,
            {
              left: p.x,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.size / 4,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    pointerEvents: 'none',
  },
  particle: { position: 'absolute', top: 0 },
});
