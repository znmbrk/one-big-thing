import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface TaskInputProps {
  onSubmit: (text: string) => void;
}

export const TaskInput = ({ onSubmit }: TaskInputProps) => {
  const [text, setText] = useState('');
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.text,
            borderColor: theme.border,
            backgroundColor: theme.cardBackground,
          }
        ]}
        placeholder="What's your one big thing today?"
        placeholderTextColor={theme.secondaryText}
        value={text}
        onChangeText={setText}
        returnKeyType="done"
        onSubmitEditing={() => {
          if (text.trim()) {
            onSubmit(text.trim());
            setText('');
          }
        }}
        autoCorrect={false}
        autoCapitalize="sentences"
      />
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: text.trim() ? theme.accent : theme.accent + '60' },
        ]}
        onPress={() => {
          if (text.trim()) {
            onSubmit(text);
            setText('');
          }
        }}
        disabled={!text.trim()}
        accessibilityState={{ disabled: !text.trim() }}
      >
        <Text style={[styles.buttonText, { color: theme.devButtonText }]}>Set Goal</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA', // fallback; overridden inline with theme.border
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    // backgroundColor set inline with theme.accent
    padding: 15,
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    // color set inline with theme.devButtonText
    fontSize: 16,
    fontWeight: '600',
  },
}); 