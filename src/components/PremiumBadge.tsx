import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PremiumBadgeProps } from '../types/subscription';

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ 
  size = 'medium', 
  showText = true 
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate badge appearance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      
    ]).start();
  }, []);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { paddingHorizontal: 6, paddingVertical: 2 },
          text: { fontSize: 10 },
          icon: { fontSize: 8 },
        };
      case 'large':
        return {
          container: { paddingHorizontal: 12, paddingVertical: 6 },
          text: { fontSize: 14 },
          icon: { fontSize: 12 },
        };
      default: // medium
        return {
          container: { paddingHorizontal: 8, paddingVertical: 4 },
          text: { fontSize: 12 },
          icon: { fontSize: 10 },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        sizeStyles.container,
        {
          backgroundColor: theme.accent + '20',
          borderColor: theme.accent + '40',
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >

      
      {showText && (
        <Text style={[
          styles.text,
          sizeStyles.text,
          { color: theme.accent }
        ]}>
          Premium
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
  },
  text: {
    fontWeight: '600',
    marginLeft: 4,
  },
  sparkle: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  sparkleIcon: {
    fontSize: 8,
  },
}); 