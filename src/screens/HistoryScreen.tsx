import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTaskHistory } from '../hooks/useTaskHistory';
import { DailyTask } from '../types/Task';
import { format } from 'date-fns';

export const HistoryScreen = () => {
  const { tasks, loading, refreshHistory } = useTaskHistory(7); // 7-day limit

  const renderTask = ({ item }: { item: DailyTask }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <Text style={styles.date}>{format(new Date(item.date), 'MMM d')}</Text>
        <View style={[styles.status, item.completed ? styles.completed : styles.incomplete]}>
          <Text style={styles.statusText}>
            {item.completed ? '✓ Done' : 'Incomplete'}
          </Text>
        </View>
      </View>
      <Text style={styles.taskText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={item => `${item.date}-${item.id}`}
        contentContainerStyle={styles.list}
        onRefresh={refreshHistory}
        refreshing={loading}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks completed yet</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completed: {
    backgroundColor: '#E8F5E9',
  },
  incomplete: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
}); 