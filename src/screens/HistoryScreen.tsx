import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTaskHistory } from '../hooks/useTaskHistory';
import { DailyTask } from '../types/Task';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HistoryScreen = () => {
  const { tasks, loading, refreshHistory } = useTaskHistory();
  const { theme } = useTheme();
  const visibleTasks = tasks.slice(0, 7); // Show only 7 days
  const hasMoreTasks = tasks.length > 7;

  const renderTask = ({ item }: { item: DailyTask }) => (
    <View style={[styles.taskItem, { 
      backgroundColor: theme.cardBackground,
      borderColor: theme.border 
    }]}>
      <View style={styles.taskHeader}>
        <Text style={[styles.date, { color: theme.secondaryText }]}>
          {format(new Date(item.date), 'MMM d')}
        </Text>
        <View style={[
          styles.status, 
          { backgroundColor: item.completed ? theme.successBackground : theme.errorBackground }
        ]}>
          <Text style={[styles.statusText, { 
            color: item.completed ? theme.successText : theme.errorText 
          }]}>
            {item.completed ? '✓ Done' : 'Incomplete'}
          </Text>
        </View>
      </View>
      <Text style={[styles.taskText, { color: theme.text }]}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={visibleTasks}
        renderItem={renderTask}
        keyExtractor={item => `${item.date}-${item.id}`}
        contentContainerStyle={styles.list}
        onRefresh={refreshHistory}
        refreshing={loading}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            No tasks completed yet
          </Text>
        }
        ListFooterComponent={hasMoreTasks ? (
          <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.upgradeText, { color: theme.accent }]}>
              🔓 Unlock Full History
            </Text>
            <Text style={[styles.upgradeSubtext, { color: theme.secondaryText }]}>
              Subscribe to see your complete task history
            </Text>
          </TouchableOpacity>
        ) : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  taskItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
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
  upgradeButton: {
    backgroundColor: '#F0F8FF',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  upgradeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  upgradeSubtext: {
    fontSize: 14,
    color: '#666',
  },
}); 