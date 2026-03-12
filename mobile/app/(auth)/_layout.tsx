import { Stack } from 'expo-router'
import { colors } from '../../theme/colors'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.forest[500] },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Log In', headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: 'Create Account' }} />
      <Stack.Screen name="confirm" options={{ title: 'Verify Email' }} />
    </Stack>
  )
}
