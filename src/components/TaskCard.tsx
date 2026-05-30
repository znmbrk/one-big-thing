import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { DailyTask } from '../types/Task';
import { useTheme } from '../context/ThemeContext';

interface TaskCardProps {
  task: DailyTask;
  onToggleComplete: () => void;
  checkboxScale: Animated.Value;
}

export const TaskCard = ({ task, onToggleComplete, checkboxScale }: TaskCardProps) => {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const hasFiredConfetti = useRef(false);

  useEffect(() => {
    if (!task.completed) {
      hasFiredConfetti.current = false;
    }
  }, [task.id, task.completed]);

  const shouldShowConfetti = task.completed && !hasFiredConfetti.current;
  if (shouldShowConfetti) {
    hasFiredConfetti.current = true;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.cardBackground, shadowColor: theme.shadowColor },
        task.completed && { backgroundColor: theme.accent + '08' },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.taskText,
            { color: theme.text },
            task.completed && styles.taskTextCompleted,
          ]}
        >
          {task.text}
        </Text>

        <TouchableOpacity
          onPress={onToggleComplete}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          accessibilityState={{ checked: task.completed }}
        >
          <Animated.View
            style={[
              styles.checkCircle,
              { borderColor: theme.accent, transform: [{ scale: checkboxScale }] },
              task.completed && { backgroundColor: theme.accent, borderColor: theme.accent },
            ]}
          >
            {task.completed && <Text style={styles.checkmark}>✓</Text>}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {shouldShowConfetti && (
        <ConfettiCannon
          count={50}
          origin={{ x: screenWidth / 2, y: 0 }}
          autoStart
          fadeOut
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 16,
  },
  taskText: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  taskTextCompleted: {
    opacity: 0.35,
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkmark: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 30,
  },
});
