import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControlProps, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { DailyTask } from '../types/Task';
import { format, isSameDay } from 'date-fns';

interface TaskTimelineProps {
  tasks: DailyTask[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

interface GroupedTasks {
  date: string;
  tasks: DailyTask[];
}

export const TaskTimeline = ({ tasks, refreshControl }: TaskTimelineProps) => {
  const { theme } = useTheme();
  const { isPremium, isFree } = useSubscription();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [isInitialized, setIsInitialized] = useState(false);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

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

  // Initialize main animations
  useEffect(() => {
    if (!isInitialized && groupedTasks.length > 0) {
      setIsInitialized(true);
      
      // Animate timeline appearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate items in sequence
      groupedTasks.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems(prev => new Set([...prev, index]));
        }, index * 100);
      });
    }
  }, [groupedTasks.length, isInitialized]);

  const renderTimelineItem = ({ item, index }: { item: GroupedTasks; index: number }) => {
    const isVisible = visibleItems.has(index);
    
    return (
      <Animated.View
        style={[
          styles.timelineItem,
          { 
            backgroundColor: theme.cardBackground,
            opacity: isVisible ? 1 : 0,
            transform: [{ translateY: isVisible ? 0 : 30 }],
          },
        ]}
      >
        <View style={styles.dateHeader}>
          <Text style={[styles.dateText, { color: theme.text }]}>
            {item.date}
          </Text>
          <View style={[styles.dateLine, { backgroundColor: theme.border }]} />
        </View>
        
        {item.tasks.map((task, taskIndex) => (
          <View 
            key={task.id} 
            style={[
              styles.taskCard,
              { 
                backgroundColor: task.completed 
                  ? (isPremium ? theme.accent + '15' : theme.accent + '20')
                  : theme.cardBackground,
                // Premium-specific styling for completed tasks
                ...(isPremium && task.completed && {
                  borderLeftWidth: 3,
                  borderLeftColor: theme.accent,
                  shadowColor: theme.accent,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }),
              }
            ]}
          >
            <View style={styles.taskContent}>
              <View style={styles.taskTextContainer}>
                <Text style={[styles.taskText, { color: theme.text }]}>
                  {task.text}
                </Text>
              </View>
              {task.completed && (
                <View style={[
                  styles.completedBadge,
                  { 
                    backgroundColor: isPremium ? theme.accent : theme.accent + '20',
                    borderColor: isPremium ? theme.accent : theme.accent,
                  }
                ]}>
                  <Text style={[
                    styles.completedText, 
                    { color: isPremium ? 'white' : theme.accent }
                  ]}>
                    ✓ Completed
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </Animated.View>
    );
  };

  // Show upgrade prompt for free users if they have limited data
  const showUpgradePrompt = isFree && tasks.length === 0;

  if (showUpgradePrompt) {
    return (
      <Animated.View 
        style={[
          styles.emptyContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.upgradePromptContainer}>
          <Text style={[styles.upgradePromptTitle, { color: theme.text }]}>
            Start Your Journey
          </Text>
          <Text style={[styles.upgradePromptText, { color: theme.secondaryText }]}>
            Complete your first "one big thing" to see your timeline
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Show premium indicator for premium users
  const renderPremiumHeader = () => {
    if (!isPremium) return null;
    
    return (
      <Animated.View 
        style={[
          styles.premiumHeader, 
          { 
            backgroundColor: theme.accent + '10',
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.premiumHeaderText, { color: theme.accent }]}>
          ✨ Premium: Unlimited Timeline Access
        </Text>
        <Text style={[styles.premiumHeaderSubtext, { color: theme.secondaryText }]}>
          View your complete history of "one big things"
        </Text>
      </Animated.View>
    );
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {renderPremiumHeader()}
      <FlatList
        data={groupedTasks}
        renderItem={renderTimelineItem}
        keyExtractor={item => item.date}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        bounces={true}
        snapToAlignment="start"
        scrollEventThrottle={16}
        refreshControl={refreshControl}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
              {isPremium ? 'No tasks yet. Start your journey!' : 'Complete your first task to see your timeline'}
            </Text>
          </View>
        }
        // Ensure items are visible immediately
        initialNumToRender={groupedTasks.length}
        maxToRenderPerBatch={groupedTasks.length}
        windowSize={groupedTasks.length + 1}
        removeClippedSubviews={false}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
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
    alignItems: 'flex-start',
  },
  taskTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  taskText: {
    fontSize: 16,
    lineHeight: 22,
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  upgradePromptContainer: {
    alignItems: 'center',
    padding: 32,
  },
  upgradePromptTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  upgradePromptText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  premiumHeader: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  premiumHeaderSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
}); 