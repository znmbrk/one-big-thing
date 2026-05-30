import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ReminderSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  offsets: number[];
  hardCapHour: number;
  onSave: (offsets: number[], hardCapHour: number) => void;
}

const formatHour = (h: number): string => {
  if (h === 12) return '12 PM';
  if (h > 12) return `${h - 12} PM`;
  return `${h} AM`;
};

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

const Stepper = ({
  label,
  value,
  onDecrement,
  onIncrement,
  displayValue,
  theme,
}: {
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  displayValue: string;
  theme: any;
}) => (
  <View style={styles.stepperRow}>
    <Text style={[styles.stepperLabel, { color: theme.text }]}>{label}</Text>
    <View style={styles.stepperControls}>
      <TouchableOpacity
        onPress={onDecrement}
        style={[styles.stepperButton, { borderColor: theme.border }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={`Decrease ${label}`}
        accessibilityRole="button"
      >
        <Text style={[styles.stepperButtonText, { color: theme.text }]}>−</Text>
      </TouchableOpacity>
      <Text style={[styles.stepperValue, { color: theme.text }]}>{displayValue}</Text>
      <TouchableOpacity
        onPress={onIncrement}
        style={[styles.stepperButton, { borderColor: theme.border }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={`Increase ${label}`}
        accessibilityRole="button"
      >
        <Text style={[styles.stepperButtonText, { color: theme.text }]}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  visible,
  onClose,
  offsets,
  hardCapHour,
  onSave,
}) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isModalMounted, setIsModalMounted] = useState(false);

  const [localOffsets, setLocalOffsets] = useState<number[]>(offsets);
  const [localCap, setLocalCap] = useState<number>(hardCapHour);

  useEffect(() => {
    if (visible) {
      setLocalOffsets(offsets);
      setLocalCap(hardCapHour);
      setIsModalMounted(true);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isModalMounted) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }),
      ]).start(() => setIsModalMounted(false));
    }
  }, [visible]);

  const updateOffset = (index: number, delta: number) => {
    setLocalOffsets(prev => {
      const next = [...prev];
      next[index] = clamp(next[index] + delta, 1, 12);
      return next;
    });
  };

  const handleSave = () => {
    onSave(localOffsets, localCap);
    onClose();
  };

  if (!isModalMounted) return null;

  const offsetLabels = ['First reminder', 'Second reminder', 'Third reminder'];

  return (
    <Modal transparent visible={isModalMounted} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: theme.inactiveDot }]} />

        {/* Header */}
        <Text style={[styles.title, { color: theme.text }]}>Reminder Cadence</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          We'll remind you at these intervals after you set your task.
        </Text>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Offset steppers */}
        {localOffsets.map((offset, i) => (
          <Stepper
            key={i}
            label={offsetLabels[i]}
            value={offset}
            displayValue={`${offset}h`}
            onDecrement={() => updateOffset(i, -1)}
            onIncrement={() => updateOffset(i, 1)}
            theme={theme}
          />
        ))}

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Hard cap stepper */}
        <Stepper
          label="Stop after"
          value={localCap}
          displayValue={formatHour(localCap)}
          onDecrement={() => setLocalCap(c => clamp(c - 1, 18, 22))}
          onIncrement={() => setLocalCap(c => clamp(c + 1, 18, 22))}
          theme={theme}
        />

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.cancelButton, { borderColor: theme.border }]}
            accessibilityRole="button"
          >
            <Text style={[styles.cancelText, { color: theme.secondaryText }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, { backgroundColor: theme.accent }]}
            accessibilityRole="button"
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 0.5,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  stepperLabel: {
    fontSize: 15,
    fontWeight: '400',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 18,
    fontWeight: '300',
    lineHeight: 22,
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '500',
    minWidth: 44,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
