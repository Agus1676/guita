export const Colors = {
  dark: {
    background: '#0A0A0F',
    surface: '#1A1A2E',
    surfaceElevated: '#252540',
    primary: '#6C63FF',
    primaryLight: '#9F7AEA',
    primaryDark: '#5A52D5',
    income: '#00D09C',
    incomeDark: '#00B386',
    expense: '#FF6B6B',
    expenseDark: '#E85555',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0B8',
    textTertiary: '#6B6B80',
    border: '#2A2A45',
    borderLight: '#353555',
    overlay: 'rgba(0,0,0,0.5)',
    tabBar: '#12121E',
    tabBarBorder: '#1E1E35',
    inputBackground: '#1E1E35',
    shadow: '#000000',
  },
  light: {
    background: '#F5F5FA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    primary: '#6C63FF',
    primaryLight: '#9F7AEA',
    primaryDark: '#5A52D5',
    income: '#00B386',
    incomeDark: '#009973',
    expense: '#E85555',
    expenseDark: '#D04444',
    textPrimary: '#1A1A2E',
    textSecondary: '#6B6B80',
    textTertiary: '#9898AC',
    border: '#E8E8F0',
    borderLight: '#F0F0F5',
    overlay: 'rgba(0,0,0,0.3)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E8E8F0',
    inputBackground: '#F0F0F5',
    shadow: '#C0C0D0',
  },
};

export type ThemeColors = typeof Colors.dark;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};
