import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface StreakBarProps {
  completedDays: number[];  // Array of 0s and 1s for the last 7 days
}

export const StreakBar = ({ completedDays }: StreakBarProps) => {
  return (
    <View style={styles.container}>
      {completedDays.map((completed, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            completed ? styles.dotCompleted : styles.dotIncomplete
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotCompleted: {
    backgroundColor: '#007AFF',
  },
  dotIncomplete: {
    backgroundColor: '#E5E5EA',
  },
}); 