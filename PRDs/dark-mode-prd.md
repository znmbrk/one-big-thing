# 🌓 Dark Mode Support PRD

## 📱 Feature Overview
Add system-based dark/light mode theming to improve usability and match iOS conventions.

## 🎯 Goals
- Support system dark/light mode preferences automatically
- Maintain consistent visual hierarchy in both modes
- Follow iOS design guidelines for dark mode colors
- Ensure all UI elements are legible in both modes

## 📋 Requirements

### Core Functionality
- App detects and responds to system appearance changes
- All screens/components adapt to current theme
- Smooth transition when theme changes
- Persist theme preference across app restarts

### Theme Colors
- Define semantic color tokens (e.g., background, text, accent)
- Create dark/light variants for each token
- Ensure sufficient contrast ratios (WCAG AA)
- Match iOS system dark mode colors where appropriate

### Components to Update
1. **HomeScreen**
   - Background color
   - Text colors
   - Streak bar dots
   - Task card styling
   
2. **TaskCard**
   - Background
   - Text colors
   - Checkbox colors
   - Shadow adjustments
   
3. **StreakBar**
   - Dot colors (active/inactive)
   - Test button (dev only)

4. **HistoryScreen**
   - Background
   - List items
   - Text colors

## 🛠️ Technical Implementation

### 1. Theme Configuration
typescript
// Define theme interface
interface Theme {
background: string;
text: string;
textSecondary: string;
accent: string;
cardBackground: string;
dotActive: string;
dotInactive: string;
}
// Create theme objects
const lightTheme: Theme = {
background: '#FFFFFF',
text: '#000000',
textSecondary: '#666666',
accent: '#007AFF',
cardBackground: '#FFFFFF',
dotActive: '#007AFF',
dotInactive: '#E5E5EA',
};
const darkTheme: Theme = {
background: '#000000',
text: '#FFFFFF',
textSecondary: '#ABABAB',
accent: '#0A84FF',
cardBackground: '#1C1C1E',
dotActive: '#0A84FF',
dotInactive: '#48484A',
};


### 2. Theme Provider Setup
typescript
// Create context and hook
const ThemeContext = createContext<Theme>(lightTheme);
const useTheme = () => useContext(ThemeContext);
// Provider component
const ThemeProvider: React.FC = ({ children }) => {
const colorScheme = useColorScheme();
const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
return (
<ThemeContext.Provider value={theme}>
{children}
</ThemeContext.Provider>
);
};

## 📝 Implementation Steps

1. **Setup**
   - Create theme configuration
   - Set up ThemeProvider
   - Add useTheme hook

2. **Core Components**
   - Update HomeScreen styles
   - Modify TaskCard theme support
   - Adapt StreakBar colors

3. **Additional Screens**
   - Update HistoryScreen
   - Test navigation theming

4. **Testing & Polish**
   - Test system theme changes
   - Verify contrast ratios
   - Check transitions
   - Test edge cases

## 🎨 Design Guidelines

- Follow iOS system colors where possible
- Maintain consistent spacing/layout
- Ensure text remains legible (contrast)
- Use subtle shadows in light mode
- Reduce shadow intensity in dark mode

## ✅ Success Metrics

- App correctly responds to system theme changes
- All UI elements maintain proper contrast
- No visual bugs when switching themes
- Consistent appearance across all screens

## 🔄 Future Considerations

- Add manual theme override option
- Support dynamic color system
- Add custom theme options
- Consider animation durations for theme transitions

Would you like me to start with implementing any specific part of this plan?