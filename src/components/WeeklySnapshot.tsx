import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { DailyTask } from '../types/Task';
import { format } from 'date-fns';

interface WeeklySnapshotProps {
  tasks: DailyTask[];
  onDayPress?: (task: DailyTask | null, day: string) => void;
}

export const WeeklySnapshot = ({ tasks, onDayPress }: WeeklySnapshotProps) => {
  const { theme } = useTheme();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const screenWidth = Dimensions.get('window').width;
  const cellSize = (screenWidth - 48) / 3; // 48 = total horizontal padding and gaps

  // Animation values for each cell
  const fadeAnims = useRef(days.map(() => new Animated.Value(0))).current;
  const scaleAnims = useRef(days.map(() => new Animated.Value(0.9))).current;

  useEffect(() => {
    // Stagger the fade-in animations
    days.forEach((_, index) => {
      Animated.sequence([
        Animated.delay(index * 100), // Stagger each cell
        Animated.parallel([
          Animated.timing(fadeAnims[index], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnims[index], {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, []);

  const getDayTask = (dayName: string) => {
    return tasks.find(task => {
      const taskDate = new Date(task.date);
      const taskDayName = format(taskDate, 'E').substring(0, 3);
      return taskDayName === dayName;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.daysContainer}>
        {days.map((day, index) => {
          const dayTask = getDayTask(day);
          const isToday = format(today, 'E').substring(0, 3) === day;
          const isCompleted = dayTask?.completed;
          const taskDate = dayTask ? new Date(dayTask.date) : null;
          
          return (
            <Animated.View
              key={day}
              style={[
                styles.animatedContainer,
                {
                  opacity: fadeAnims[index],
                  transform: [{ scale: scaleAnims[index] }],
                },
              ]}
            >
              <Pressable 
                onPress={() => onDayPress?.(dayTask || null, day)}
                style={({ pressed }) => [
                  styles.dayCell,
                  {
                    backgroundColor: isCompleted 
                      ? theme.accent 
                      : theme.cardBackground,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                    width: cellSize,
                    height: cellSize,
                  }
                ]}
              >
                <View style={styles.dayHeader}>
                  <Text style={[styles.dayText, { color: isCompleted ? 'white' : theme.secondaryText }]}>
                    {day}
                  </Text>
                  {taskDate && (
                    <Text style={[styles.dateText, { color: isCompleted ? 'white' : theme.secondaryText }]}>
                      {format(taskDate, 'MMM d')}
                    </Text>
                  )}
                </View>
                {dayTask && (
                  <Text 
                    style={[styles.taskText, { color: isCompleted ? 'white' : theme.text }]}
                    numberOfLines={2}
                  >
                    {dayTask.text}
                  </Text>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  dayCell: {
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 18,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskText: {
    fontSize: 14,
    marginTop: 8,
  },
  animatedContainer: {
    // This ensures the animated view doesn't affect layout
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 