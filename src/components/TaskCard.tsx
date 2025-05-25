import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { DailyTask } from '../types/Task';
import { useQuote } from '../hooks/useQuote';

interface TaskCardProps {
  task: DailyTask;
  onToggleComplete: () => void;
  checkboxScale: Animated.Value;
}

export const TaskCard = ({ task, onToggleComplete, checkboxScale }: TaskCardProps) => {
  const quote = useQuote();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.title}>Today's Focus</Text>
        </View>
        <Text style={styles.taskText}>{task.text}</Text>
        
        <TouchableOpacity
          onPress={onToggleComplete}
          style={styles.completionButton}
        >
          <Animated.View
            style={[
              styles.checkCircle,
              { transform: [{ scale: checkboxScale }] },
              task.completed && styles.completed
            ]}
          >
            {task.completed && <Text style={styles.checkmark}>✓</Text>}
          </Animated.View>
          <Text style={styles.buttonText}>
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
        
        <Text style={styles.quote}>{quote}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
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
    color: '#666',
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
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  completed: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '600',
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  quote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
  },
}); 