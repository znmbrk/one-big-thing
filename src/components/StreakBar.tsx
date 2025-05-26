import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Pressable, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { format } from 'date-fns';

interface StreakBarProps {
  completedDays: number[];  // Array of 0s and 1s for the last 7 days
  onUpdate?: (newDays: number[]) => void;  // Add this prop
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const StreakBar = ({ completedDays, onUpdate }: StreakBarProps) => {
  const dotAnimations = useRef(completedDays.map(() => new Animated.Value(1))).current;
  const { theme } = useTheme();

  // Get current day index (0 = Monday, 6 = Sunday)
  const getCurrentDayIndex = () => {
    const day = format(new Date(), 'E'); // Returns Mon, Tue, etc.
    const index = WEEKDAYS.findIndex(d => d === day[0]); // Match first letter
    console.log('Current day:', day, 'Index:', index);
    return index;
  };

  const [currentDayIndex, setCurrentDayIndex] = useState(getCurrentDayIndex());

  // DEV ONLY - Simulate completion for the current day
//   const simulateCompletion = () => {
//     if (!onUpdate) return;
    
//     const newCompletedDays = [...completedDays];
//     newCompletedDays[currentDayIndex] = 1;
    
//     console.log('Completing day:', WEEKDAYS[currentDayIndex]);
//     onUpdate(newCompletedDays);
//   };

  // DEV ONLY - Simulate next day
//   const simulateNextDay = () => {
//     if (!onUpdate) return;
//     const nextIndex = (currentDayIndex + 1) % 7;
//     setCurrentDayIndex(nextIndex);
//     console.log('Moving to day:', WEEKDAYS[nextIndex]);
//   };

  // DEV ONLY - Simulate week change
//   const simulateWeekChange = () => {
//     if (!onUpdate) return;
//     console.log('Simulating new week');
//     onUpdate(Array(7).fill(0));
//   };

  // Force refresh when completedDays changes
  useEffect(() => {
    console.log('StreakBar received completedDays:', completedDays);
    
    // Reset animations
    dotAnimations.forEach((anim, index) => {
      if (completedDays[index]) {
        console.log('Animating dot at index:', index);
        Animated.sequence([
          Animated.spring(anim, {
            toValue: 1.3,
            useNativeDriver: true,
            friction: 3,
            tension: 40,
          }),
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 3,
            tension: 40,
          }),
        ]).start();
      }
    });
  }, [completedDays]);

  return (
    <View>
      {/* Weekday labels */}
      <View style={styles.container}>
        {WEEKDAYS.map((day, index) => (
          <Text key={`day-${index}`} style={[styles.dayLabel, { color: theme.secondaryText }]}>
            {day}
          </Text>
        ))}
      </View>
      
      {/* Dots */}
      <View style={styles.container}>
        {completedDays.map((completed, index) => (
          <View key={`dot-${index}`} style={{ width: 12, alignItems: 'center' }}>
            <Animated.View
              style={[
                styles.dot,
                { 
                  backgroundColor: completed ? theme.accent : theme.inactiveDot,
                  transform: [{ scale: dotAnimations[index] }] 
                }
              ]}
            />
          </View>
        ))}
      </View>

      {/* DEV ONLY buttons */}
      {/* {__DEV__ && (
        <View>
          <Pressable 
            onPress={simulateCompletion}
            style={[styles.devButton, { backgroundColor: theme.devButton }]}
          >
            <Text style={[styles.devButtonText, { color: theme.devButtonText }]}>
              🧪 Test Next Completion
            </Text>
          </Pressable>
          
          <Pressable 
            onPress={simulateNextDay}
            style={[styles.devButton, { backgroundColor: theme.devButton, marginTop: 8 }]}
          >
            <Text style={[styles.devButtonText, { color: theme.devButtonText }]}>
              ⏭️ Simulate Next Day
            </Text>
          </Pressable>
          
          <Pressable 
            onPress={simulateWeekChange}
            style={[styles.devButton, { backgroundColor: theme.devButton, marginTop: 8 }]}
          >
            <Text style={[styles.devButtonText, { color: theme.devButtonText }]}>
              📅 Simulate New Week
            </Text>
          </Pressable>
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  dayLabel: {
    width: 12,  // Same width as dot container
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '500',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  devButton: {
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  devButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 