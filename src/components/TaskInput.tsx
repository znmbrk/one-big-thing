import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

interface TaskInputProps {
  onSubmit: (text: string) => void;
}

export const TaskInput = ({ onSubmit }: TaskInputProps) => {
  const [text, setText] = useState('');
  const { theme } = useTheme();

  // Prompt breathing animation
  const promptOpacity = useRef(new Animated.Value(1)).current;
  const breathingAnim = useRef<Animated.CompositeAnimation | null>(null);
  const hasStartedTyping = useRef(false);

  // Hold-to-submit
  const holdScale = useRef(new Animated.Value(0)).current;
  const holdAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ripple on completion
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(1)).current;

  // Start breathing loop on mount
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(promptOpacity, {
          toValue: 0.55,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(promptOpacity, {
          toValue: 1.0,
          duration: 2800,
          useNativeDriver: true,
        }),
      ]),
    );
    breathingAnim.current = loop;
    loop.start();

    return () => {
      loop.stop();
    };
  }, []);

  const handleChangeText = (value: string) => {
    setText(value);

    if (!hasStartedTyping.current && value.length > 0) {
      hasStartedTyping.current = true;
      // Stop breathing loop and fade out prompt
      breathingAnim.current?.stop();
      Animated.timing(promptOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    if (value.length === 0 && hasStartedTyping.current) {
      // Restore breathing when text is cleared
      hasStartedTyping.current = false;
      promptOpacity.setValue(1);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(promptOpacity, {
            toValue: 0.55,
            duration: 2800,
            useNativeDriver: true,
          }),
          Animated.timing(promptOpacity, {
            toValue: 1.0,
            duration: 2800,
            useNativeDriver: true,
          }),
        ]),
      );
      breathingAnim.current = loop;
      loop.start();
    }
  };

  const handlePressIn = () => {
    if (!text.trim()) return;

    // Start haptic ticks every ~1s
    hapticIntervalRef.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 1000);

    // Animate hold fill
    holdScale.setValue(0);
    const anim = Animated.timing(holdScale, {
      toValue: 1,
      duration: 6000,
      useNativeDriver: false,
    });
    holdAnimRef.current = anim;
    anim.start(({ finished }) => {
      if (finished) {
        // Clear haptic interval
        if (hapticIntervalRef.current) {
          clearInterval(hapticIntervalRef.current);
          hapticIntervalRef.current = null;
        }

        // Success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Trigger ripple
        rippleScale.setValue(0);
        rippleOpacity.setValue(1);
        Animated.parallel([
          Animated.timing(rippleScale, {
            toValue: 40,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onSubmit(text.trim());
        });
      }
    });
  };

  const handlePressOut = () => {
    // Clear haptic interval
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }

    // Stop and reset hold animation
    holdAnimRef.current?.stop();
    Animated.timing(holdScale, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Interpolate inner circle size from holdScale (0 → 1) to width/height (0 → 72)
  const innerSize = holdScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 72],
  });

  const innerBorderRadius = holdScale.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 36],
  });

  return (
    <View style={styles.outerContainer}>
      {/* Centred area: prompt + input */}
      <View style={styles.centredArea}>
        <Animated.Text
          style={[
            styles.promptText,
            { color: theme.text, opacity: promptOpacity },
          ]}
        >
          What's your one big thing today?
        </Animated.Text>

        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={text}
          onChangeText={handleChangeText}
          placeholder=""
          placeholderTextColor="transparent"
          autoFocus
          returnKeyType="done"
          multiline={false}
          autoCorrect={false}
          autoCapitalize="sentences"
        />
      </View>

      {/* Bottom hold area — only visible when text exists */}
      {text.length > 0 && (
        <View style={styles.holdArea}>
          <Text style={[styles.hintText, { color: theme.secondaryText }]}>
            Hold to set your goal
          </Text>

          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.holdCircleWrapper}
          >
            {/* Outer ring */}
            <View
              style={[
                styles.holdCircleOuter,
                { borderColor: theme.accent },
              ]}
            >
              {/* Inner fill grows on hold */}
              <Animated.View
                style={[
                  styles.holdCircleInner,
                  {
                    backgroundColor: theme.accent,
                    width: innerSize,
                    height: innerSize,
                    borderRadius: innerBorderRadius,
                  },
                ]}
              />
            </View>

            {/* Ripple — absolutely positioned over the circle */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ripple,
                {
                  backgroundColor: theme.accent,
                  opacity: rippleOpacity,
                  transform: [{ scale: rippleScale }],
                },
              ]}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  centredArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  promptText: {
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 38,
    paddingHorizontal: 40,
  },
  input: {
    fontSize: 26,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 32,
    width: '100%',
    minHeight: 44,
  },
  holdArea: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 32,
    gap: 8,
  },
  hintText: {
    fontSize: 12,
    textAlign: 'center',
  },
  holdCircleWrapper: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdCircleOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  holdCircleInner: {
    position: 'absolute',
  },
  ripple: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    zIndex: 100,
  },
});
