import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { DailyTask } from '../types/Task';

interface TaskCardProps {
  task: DailyTask;
  onToggleComplete: () => void;
  checkboxScale: Animated.Value;
}

export const TaskCard = ({ task, onToggleComplete, checkboxScale }: TaskCardProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.taskText}>{task.text}</Text>
      <TouchableOpacity
        onPress={onToggleComplete}
        style={styles.checkboxContainer}
      >
        <Animated.View
          style={[
            styles.checkbox,
            { transform: [{ scale: checkboxScale }] },
            task.completed && styles.checkboxCompleted,
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskText: {
    fontSize: 18,
    flex: 1,
    marginRight: 15,
  },
  checkboxContainer: {
    padding: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
  },
}); 