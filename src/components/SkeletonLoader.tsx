import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { BorderRadius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = BorderRadius.md,
  style 
}: SkeletonProps) {
  const { colors } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.surfaceElevated,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <View style={{ padding: 20 }}>
      <SkeletonLoader height={60} borderRadius={16} style={{ marginBottom: 20 }} />
      <SkeletonLoader height={70} borderRadius={16} style={{ marginBottom: 20 }} />
      <SkeletonLoader height={160} borderRadius={20} style={{ marginBottom: 24 }} />
      <SkeletonLoader height={220} borderRadius={20} style={{ marginBottom: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});
