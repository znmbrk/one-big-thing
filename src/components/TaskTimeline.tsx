import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { DailyTask } from '../types/Task';
import { format, isSameDay } from 'date-fns';

interface TaskTimelineProps {
  tasks: DailyTask[];
}

interface GroupedTasks {
  date: string;
  tasks: DailyTask[];
}

export const TaskTimeline = ({ tasks }: TaskTimelineProps) => {
  const { theme } = useTheme();

  // Group tasks by date
  const groupedTasks = tasks.reduce((groups: GroupedTasks[], task) => {
    const date = format(new Date(task.date), 'MMM d, yyyy');
    const existingGroup = groups.find(group => group.date === date);
    
    if (existingGroup) {
      existingGroup.tasks.push(task);
    } else {
      groups.push({ date, tasks: [task] });
    }
    
    return groups;
  }, []);

  const renderTimelineItem = ({ item }: { item: GroupedTasks }) => (
    <View style={[styles.timelineItem, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.dateHeader}>
        <Text style={[styles.dateText, { color: theme.text }]}>
          {item.date}
        </Text>
        <View style={[styles.dateLine, { backgroundColor: theme.border }]} />
      </View>
      
      {item.tasks.map((task, index) => (
        <View 
          key={task.id} 
          style={[
            styles.taskCard,
            { backgroundColor: task.completed ? theme.accent + '20' : theme.cardBackground }
          ]}
        >
          <View style={styles.taskContent}>
            <Text style={[styles.taskText, { color: theme.text }]}>
              {task.text}
            </Text>
            {task.completed && (
              <Text style={[styles.completedText, { color: theme.accent }]}>
                ✓ Completed
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <FlatList
      data={groupedTasks}
      renderItem={renderTimelineItem}
      keyExtractor={item => item.date}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      decelerationRate="normal"
      bounces={true}
      snapToAlignment="start"
      scrollEventThrottle={16}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  timelineItem: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  taskCard: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  taskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 