import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { DailyTask } from '../types/Task';

interface CalendarViewProps {
  tasks: DailyTask[];
  onDayPress?: (task: DailyTask | null, day: string) => void;
}

export const CalendarView = ({ tasks, onDayPress }: CalendarViewProps) => {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentDate]);

  const handlePrevMonth = () => {
    fadeAnim.setValue(0);
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    fadeAnim.setValue(0);
    setCurrentDate(addMonths(currentDate, 1));
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Text style={[styles.navText, { color: theme.accent }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: theme.text }]}>
          {format(currentDate, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Text style={[styles.navText, { color: theme.accent }]}>›</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDaysOfWeek = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <View style={styles.daysOfWeekContainer}>
        {days.map(day => (
          <Text key={day} style={[styles.dayOfWeekText, { color: theme.secondaryText }]}>
            {day}
          </Text>
        ))}
      </View>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const rows: React.ReactNode[] = [];
    let cells: React.ReactNode[] = [];

    const tasksByDate = tasks.reduce((acc, task) => {
      acc[format(new Date(task.date), 'yyyy-MM-dd')] = task;
      return acc;
    }, {} as { [key: string]: DailyTask });

    days.forEach((day, i) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const task = tasksByDate[dayStr];

      cells.push(
        <Pressable key={day.toString()} style={styles.cell} onPress={() => onDayPress?.(task || null, format(day, 'E'))}>
          <Text style={[
            styles.cellText,
            { color: isSameMonth(day, currentDate) ? theme.text : theme.secondaryText },
            isToday(day) && styles.todayText,
          ]}>
            {format(day, 'd')}
          </Text>
          {task && task.completed && (
            <View style={[styles.dot, { backgroundColor: theme.accent }]} />
          )}
        </Pressable>
      );
      if ((i + 1) % 7 === 0) {
        rows.push(<View key={day.toString()} style={styles.row}>{cells}</View>);
        cells = [];
      }
    });

    return <Animated.View style={{ opacity: fadeAnim }}>{rows}</Animated.View>;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  navText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  dayOfWeekText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  cell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 16,
  },
  todayText: {
    fontWeight: 'bold',
    color: '#007BFF', // A distinct color for today
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 6,
  },
}); 