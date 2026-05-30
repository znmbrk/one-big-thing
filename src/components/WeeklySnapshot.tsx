import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView, useWindowDimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from './EmptyState';
import { useSubscription } from '../context/SubscriptionContext';
import { DailyTask } from '../types/Task';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface WeeklySnapshotProps {
  tasks: DailyTask[];
  onDayPress?: (task: DailyTask | null, day: string) => void;
  refreshControl?: React.ReactElement;
}

export const WeeklySnapshot = ({ tasks, onDayPress, refreshControl }: WeeklySnapshotProps) => {
  const { theme } = useTheme();
  const { isPremium, isFree } = useSubscription();
  const { width: screenWidth } = useWindowDimensions();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const cellSize = (screenWidth - 48) / 3;

  const fadeAnims = useRef(days.map(() => new Animated.Value(0))).current;
  const scaleAnims = useRef(days.map(() => new Animated.Value(0.9))).current;

  useEffect(() => {
    days.forEach((_, index) => {
      Animated.sequence([
        Animated.delay(index * 100),
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

  const getDayTask = (dayName: string): DailyTask | undefined => {
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    return tasks.find(task => {
      const taskDate = new Date(task.date);
      const taskDayName = format(taskDate, 'EEE');
      return taskDayName === dayName && taskDate >= weekStart && taskDate <= weekEnd;
    });
  };

  const showUpgradePrompt = isFree && tasks.length === 0;

  if (showUpgradePrompt) {
    return (
      <ScrollView refreshControl={refreshControl}>
        <View style={styles.container}>
          <EmptyState
            title="Unlock Your Full Week"
            subtitle={'Complete your first "one big thing" to see your weekly progress'}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView refreshControl={refreshControl}>
      <View style={styles.container}>
        <View style={styles.daysContainer}>
          {days.map((day, index) => {
            const dayTask = getDayTask(day);
            const isToday = format(today, 'EEE') === day;
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
                        ? (isPremium ? theme.accent : theme.accent + '80')
                        : theme.cardBackground,
                      shadowColor: theme.shadowColor,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                      width: cellSize,
                      height: cellSize,
                      ...(isPremium && isCompleted && {
                        shadowColor: theme.accent,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                      }),
                    },
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

        {isPremium && (
          <View style={styles.premiumIndicator}>
            <Text style={[styles.premiumText, { color: theme.accent }]}>
              ✨ Premium: Unlimited History Access
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumIndicator: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
