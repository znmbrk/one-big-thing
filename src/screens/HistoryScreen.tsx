import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Modal, TouchableOpacity, Text, Pressable } from 'react-native';
import { useTaskHistory } from '../hooks/useTaskHistory';
import { WeeklySnapshot } from '../components/WeeklySnapshot';
import { useTheme } from '../context/ThemeContext';
import { DailyTask } from '../types/Task';
import { format } from 'date-fns';

export const HistoryScreen = () => {
  const { tasks, loading, refreshHistory } = useTaskHistory();
  const { theme } = useTheme();
  const [selectedTask, setSelectedTask] = useState<{task: DailyTask | null, day: string} | null>(null);
  const visibleTasks = tasks.slice(0, 7);

  const handleDayPress = (task: DailyTask | null, day: string) => {
    setSelectedTask({ task, day });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <WeeklySnapshot tasks={visibleTasks} onDayPress={handleDayPress} />
      
      <Modal
        visible={selectedTask !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTask(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.modalDismissArea}
            onPress={() => setSelectedTask(null)}
          />
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHandle} />
            
            {selectedTask?.task ? (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.dateContainer}>
                    <Text style={[styles.dayName, { color: theme.secondaryText }]}>
                      {selectedTask.day}
                    </Text>
                    <Text style={[styles.fullDate, { color: theme.text }]}>
                      {format(new Date(selectedTask.task.date), 'MMMM d, yyyy')}
                    </Text>
                  </View>
                  {selectedTask.task.completed && (
                    <View style={[styles.statusBadge, { backgroundColor: theme.accent + '20' }]}>
                      <Text style={[styles.statusText, { color: theme.accent }]}>
                        ✓ Completed
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.taskContainer}>
                  <Text style={[styles.taskLabel, { color: theme.secondaryText }]}>
                    Task
                  </Text>
                  <Text style={[styles.taskText, { color: theme.text }]}>
                    {selectedTask.task.text}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                  No task for {selectedTask?.day}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#999',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  dateContainer: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fullDate: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskContainer: {
    marginBottom: 24,
  },
  taskLabel: {
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  taskText: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
}); 