import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './src/navigation';
import { ThemeProvider } from './src/context/ThemeContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import React, { useEffect } from 'react';
import Purchases from 'react-native-purchases';
import { Platform, useColorScheme } from 'react-native';

const API_KEYS = {
  apple: 'appl_XnVCDkYrMoNSCnUPthacgEgRrpv',
};

export default function App() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: API_KEYS.apple });
    }
  }, []);

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
