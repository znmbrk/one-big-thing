import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ReminderStatusProps {
  offsets: number[];
  hardCapHour: number;
  onPress: () => void;
}

const formatOffset = (h: number): string => `${h}h`;

export const ReminderStatus: React.FC<ReminderStatusProps> = ({ offsets, hardCapHour, onPress }) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!offsets || offsets.length === 0) return null;

  const capLabel = `${hardCapHour > 12 ? hardCapHour - 12 : hardCapHour}pm cap`;
  const offsetLabels = offsets.map(formatOffset).join(' · ');

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.6}
        hitSlop={{ top: 10, bottom: 10, left: 16, right: 16 }}
        style={styles.container}
        accessibilityLabel={`Reminders set at ${offsetLabels}. Tap to configure.`}
        accessibilityRole="button"
      >
        <View style={[styles.dot, { backgroundColor: theme.accent }]} />
        <Text style={[styles.label, { color: theme.secondaryText }]}>
          {offsetLabels}
          <Text style={styles.cap}> · {capLabel}</Text>
        </Text>
        <Text style={[styles.chevron, { color: theme.secondaryText }]}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.7,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  cap: {
    opacity: 0.6,
  },
  chevron: {
    fontSize: 14,
    opacity: 0.5,
    marginTop: -1,
  },
});
