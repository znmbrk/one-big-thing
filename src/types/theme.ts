export interface Theme {
  background: string;
  text: string;
  textSecondary: string;
  accent: string;
  cardBackground: string;
  dotActive: string;
  dotInactive: string;
  secondaryText: string;
  border: string;
  shadowColor: string;
  inactiveDot: string;
  devButton: string;
  devButtonText: string;
  successBackground: string;
  errorBackground: string;
  successText: string;
  errorText: string;
  isDark: boolean;
}

export const lightTheme: Theme = {
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  accent: '#007AFF',
  cardBackground: '#FFFFFF',
  dotActive: '#007AFF',
  dotInactive: '#E5E5EA',
  secondaryText: '#666666',
  border: '#E5E5EA',
  shadowColor: '#000000',
  inactiveDot: '#E5E5EA',
  devButton: '#007AFF',
  devButtonText: '#FFFFFF',
  successBackground: '#D3E3FC',
  errorBackground: '#FFD3D3',
  successText: '#0047B3',
  errorText: '#CC0000',
  isDark: false,
};

export const darkTheme: Theme = {
  ...lightTheme,
  isDark: true,
  background: '#000000',
  text: '#FFFFFF',
  cardBackground: '#1C1C1E',
  secondaryText: '#ABABAB',
  accent: '#0A84FF',
  dotActive: '#0A84FF',
  dotInactive: '#48484A',
  border: '#48484A',
  shadowColor: '#FFFFFF',
  inactiveDot: '#48484A',
  devButton: '#0A84FF',
  devButtonText: '#FFFFFF',
  successBackground: '#1C1C1E',
  errorBackground: '#48484A',
  successText: '#FFFFFF',
  errorText: '#FFFFFF',
}; 