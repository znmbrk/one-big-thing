import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './src/navigation';
import { ThemeProvider } from './src/context/ThemeContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import React from 'react';
import { useColorScheme } from 'react-native';

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <SubscriptionProvider>
        <SafeAreaProvider>
          <Navigation />
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </SafeAreaProvider>
      </SubscriptionProvider>
    </ThemeProvider>
  );
}
