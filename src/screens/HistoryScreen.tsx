import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Pressable, Animated, RefreshControl, useWindowDimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskHistory } from '../hooks/useTaskHistory';
import { WeeklySnapshot } from '../components/WeeklySnapshot';
import { TaskTimeline } from '../components/TaskTimeline';
import { CalendarView } from '../components/CalendarView';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { UpgradeModal } from '../components/UpgradeModal';
import { PremiumBadge } from '../components/PremiumBadge';
import { DailyTask } from '../types/Task';
import { format } from 'date-fns';

type ViewMode = 'grid' | 'detail';

export const HistoryScreen = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { tasks, allTasks, loading, refreshHistory, error: historyError, clearError: clearHistoryError } = useTaskHistory();
  const { theme } = useTheme();
  const { isPremium, upgradeToPremium, isLoading: subscriptionLoading } = useSubscription();
  const [selectedTask, setSelectedTask] = useState<{task: DailyTask | null, day: string} | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const headerAnim = useRef(new Animated.Value(1)).current;
  const contentAnim = useRef(new Animated.Value(1)).current;
  const upgradeButtonAnim = useRef(new Animated.Value(1)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const errorTranslateY = useRef(new Animated.Value(-8)).current;

  const handleDayPress = (task: DailyTask | null, day: string) => {
    setSelectedTask({ task, day });
  };

  const handleUpgradePress = () => {
    setShowUpgradeModal(true);
  };

  const resetAnimations = () => {
    Animated.parallel([
      Animated.spring(contentAnim, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
      Animated.spring(headerAnim, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const handleUpgrade = async () => {
    try {
      setIsTransitioning(true);

      Animated.parallel([
        Animated.timing(contentAnim, { toValue: 0.8, duration: 200, useNativeDriver: true }),
        Animated.timing(headerAnim, { toValue: 0.9, duration: 200, useNativeDriver: true }),
      ]).start();

      await upgradeToPremium();
      await refreshHistory();
      setShowUpgradeModal(false);
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      if (!error?.userCancelled) {
        Alert.alert('Purchase Failed', 'Unable to complete purchase. Please try again.');
      }
    } finally {
      setIsTransitioning(false);
      resetAnimations();
    }
  };

  const switchView = (mode: ViewMode) => {
    Animated.spring(tabIndicatorAnim, {
      toValue: mode === 'grid' ? 0 : 1,
      useNativeDriver: true,
      friction: 20,
      tension: 120,
    }).start();
    setViewMode(mode);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshHistory();
    setRefreshing(false);
  }, [refreshHistory]);

  useEffect(() => {
    if (isPremium) {
      Animated.sequence([
        Animated.timing(upgradeButtonAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.spring(upgradeButtonAnim, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
      ]).start();
    }
  }, [isPremium]);

  useEffect(() => {
    if (historyError) {
      Animated.parallel([
        Animated.timing(errorOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(errorTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(clearHistoryError, 4000);
      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(errorOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(errorTranslateY, { toValue: -8, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [historyError]);

  // Tab container is width - 32 (marginHorizontal: 16 on each side)
  const tabContainerWidth = width - 32;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {historyError && (
        <Animated.View
          style={[
            styles.errorBanner,
            {
              backgroundColor: theme.errorBackground,
              opacity: errorOpacity,
              transform: [{ translateY: errorTranslateY }],
            },
          ]}
        >
          <Text style={[styles.errorMessage, { color: theme.errorText }]} numberOfLines={2}>
            {historyError}
          </Text>
          <TouchableOpacity
            onPress={clearHistoryError}
            style={styles.errorDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.errorDismissText, { color: theme.errorText }]}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      <View style={[styles.content, isLandscape && styles.landscapeContent]}>
        <View style={styles.mainContent}>
          <Animated.View
            style={[
              styles.header,
              { opacity: headerAnim, transform: [{ scale: headerAnim }] },
            ]}
          >
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>History</Text>
              {isPremium && <PremiumBadge size="small" showText={false} />}
            </View>
            {!isPremium && (
              <Animated.View style={{ opacity: upgradeButtonAnim, transform: [{ scale: upgradeButtonAnim }] }}>
                <TouchableOpacity
                  style={[
                    styles.upgradeButton,
                    { backgroundColor: subscriptionLoading ? theme.secondaryText : theme.accent },
                  ]}
                  onPress={handleUpgradePress}
                  disabled={subscriptionLoading || isTransitioning}
                >
                  <Text style={[styles.upgradeButtonText, { color: 'white' }]}>
                    {subscriptionLoading ? 'Upgrading...' : 'Upgrade'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>

          <View style={[styles.tabContainer, { backgroundColor: theme.cardBackground }]}>
            <Animated.View
              style={[
                styles.tabIndicator,
                {
                  backgroundColor: theme.accent + '20',
                  transform: [{
                    translateX: tabIndicatorAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [4, tabContainerWidth / 2],
                    }),
                  }],
                },
              ]}
            />
            <TouchableOpacity style={styles.tab} onPress={() => switchView('grid')}>
              <Text style={[styles.tabText, { color: viewMode === 'grid' ? theme.accent : theme.secondaryText }]}>
                Week View
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => switchView('detail')}>
              <Text style={[styles.tabText, { color: viewMode === 'detail' ? theme.accent : theme.secondaryText }]}>
                {isPremium ? 'Calendar' : 'Timeline'}
              </Text>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[
              styles.viewContainer,
              isLandscape && styles.landscapeViewContainer,
              { opacity: contentAnim, transform: [{ scale: contentAnim }] },
            ]}
          >
            {viewMode === 'grid' ? (
              <WeeklySnapshot
                tasks={tasks.slice(0, 7)}
                onDayPress={handleDayPress}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={theme.accent}
                    colors={[theme.accent]}
                  />
                }
              />
            ) : (
              isPremium ? (
                <CalendarView tasks={allTasks} onDayPress={handleDayPress} />
              ) : (
                <TaskTimeline
                  tasks={tasks}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor={theme.accent}
                      colors={[theme.accent]}
                    />
                  }
                />
              )
            )}
          </Animated.View>
        </View>
      </View>

      <Modal
        visible={selectedTask !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTask(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismissArea} onPress={() => setSelectedTask(null)} />
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
                      <Text style={[styles.statusText, { color: theme.accent }]}>✓ Completed</Text>
                    </View>
                  )}
                </View>
                <View style={styles.taskContainer}>
                  <Text style={[styles.taskLabel, { color: theme.secondaryText }]}>Task</Text>
                  <Text style={[styles.taskText, { color: theme.text }]}>{selectedTask.task.text}</Text>
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

      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        allTasks={allTasks}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  landscapeContent: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  mainContent: {
    flex: 1,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  upgradeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 4,
    position: 'relative',
    height: 48,
  },
  viewContainer: {
    flex: 1,
    marginTop: 8,
  },
  landscapeViewContainer: {
    paddingHorizontal: 16,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '48%',
    borderRadius: 16,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorMessage: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  errorDismiss: {
    paddingLeft: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  errorDismissText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
