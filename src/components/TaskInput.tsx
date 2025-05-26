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
      />
      <TouchableOpacity
        style={[
          styles.button,
          !text.trim() && styles.buttonDisabled
        ]}
        onPress={() => {
          if (text.trim()) {
            onSubmit(text);
            setText('');
          }
        }}
        disabled={!text.trim()}
      >
        <Text style={styles.buttonText}>Set Goal</Text>
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
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 