import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { format } from 'date-fns';

interface StreakBarProps {
  completedDays: number[];
  onUpdate?: (newDays: number[]) => void;
}

const WEEKDAYS_FULL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getCurrentDayIndex = (): number => {
  const day = format(new Date(), 'EEE');
  return WEEKDAYS_FULL.indexOf(day);
};

export const StreakBar = ({ completedDays }: StreakBarProps) => {
  const dotAnimations = useRef(completedDays.map(() => new Animated.Value(1))).current;
  const { theme } = useTheme();
  const todayIndex = getCurrentDayIndex();

  useEffect(() => {
    dotAnimations.forEach((anim, index) => {
      if (completedDays[index]) {
        Animated.sequence([
          Animated.spring(anim, {
            toValue: 1.3,
            useNativeDriver: true,
            friction: 3,
            tension: 40,
          }),
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 3,
            tension: 40,
          }),
        ]).start();
      }
    });
  }, [completedDays]);

  return (
    <View style={styles.container}>
      {completedDays.map((completed, index) => {
        const isToday = index === todayIndex;
        return (
          <View key={`dot-${index}`} style={{ width: 14, alignItems: 'center' }}>
            <Animated.View
              style={[
                styles.dot,
                {
                  backgroundColor: completed
                    ? theme.accent
                    : isToday
                    ? 'transparent'
                    : theme.inactiveDot,
                  transform: [{ scale: dotAnimations[index] }],
                },
                isToday && {
                  borderWidth: 1.5,
                  borderColor: theme.accent,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
