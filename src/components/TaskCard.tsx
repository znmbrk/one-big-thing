import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { DailyTask } from '../types/Task';
import { useQuote } from '../hooks/useQuote';
import { useTheme } from '../context/ThemeContext';

interface TaskCardProps {
  task: DailyTask;
  onToggleComplete: () => void;
  checkboxScale: Animated.Value;
}

export const TaskCard = ({ task, onToggleComplete, checkboxScale }: TaskCardProps) => {
  const quote = useQuote();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.cardBackground,
      shadowColor: theme.shadowColor,
    }]}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={[styles.title, { color: theme.secondaryText }]}>Today's Focus</Text>
        </View>
        <Text style={[styles.taskText, { color: theme.text }]}>{task.text}</Text>
        
        <TouchableOpacity
          onPress={onToggleComplete}
          style={styles.completionButton}
        >
          <Animated.View
            style={[
              styles.checkCircle,
              { 
                transform: [{ scale: checkboxScale }],
                borderColor: theme.accent,
              },
              task.completed && { backgroundColor: theme.accent }
            ]}
          >
            {task.completed && <Text style={styles.checkmark}>✓</Text>}
          </Animated.View>
          <Text style={[styles.buttonText, { color: theme.accent }]}>
            {task.completed ? 'Completed!' : 'Mark Complete'}
          </Text>
        </TouchableOpacity>

        {task.completed && (
          <ConfettiCannon
            count={50}
            origin={{x: 150, y: 0}}
            autoStart={true}
            fadeOut={true}
          />
        )}
        
        <Text style={[styles.quote, { color: theme.secondaryText }]}>{quote}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
  completionButton: {
    alignItems: 'center',
    marginVertical: 20,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  checkmark: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '600',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
  },
}); 