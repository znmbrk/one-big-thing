// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { useTheme } from '../context/ThemeContext';

// export const ThemeTest = () => {
//   const { theme, toggleTheme } = useTheme();
  
//   return (
//     <View style={styles.container}>
//       <TouchableOpacity 
//         onPress={toggleTheme}
//         style={[styles.button, { backgroundColor: theme.cardBackground }]}
//       >
//         <Text style={[styles.text, { color: theme.text }]}>
//           Current Theme: {theme.isDark ? '🌙 Dark' : '☀️ Light'}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 10,
//     position: 'absolute',
//     top: 50,
//     right: 10,
//     zIndex: 1000,
//   },
//   button: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ccc',
//   },
//   text: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
// }); 