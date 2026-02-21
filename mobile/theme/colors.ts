export const colors = {
  forest: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#2D5A27',
    600: '#245020',
    700: '#1B3D18',
    800: '#132B11',
    900: '#0A1A09',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  white: '#ffffff',
  black: '#000000',
  red: {
    500: '#ef4444',
    600: '#dc2626',
  },
} as const

export const lightTheme = {
  background: colors.white,
  surface: colors.gray[50],
  text: colors.gray[900],
  textSecondary: colors.gray[500],
  border: colors.gray[200],
  primary: colors.forest[500],
  primaryText: colors.white,
  error: colors.red[500],
  inputBackground: colors.white,
  inputBorder: colors.gray[300],
} as const

export const darkTheme = {
  background: colors.gray[900],
  surface: colors.gray[800],
  text: colors.gray[50],
  textSecondary: colors.gray[400],
  border: colors.gray[700],
  primary: colors.forest[500],
  primaryText: colors.white,
  error: colors.red[500],
  inputBackground: colors.gray[800],
  inputBorder: colors.gray[600],
} as const

export type AppTheme = {
  [K in keyof typeof lightTheme]: string
}
