import { Tabs } from 'expo-router'
import { FontAwesome6 } from '@expo/vector-icons'
import { UserProvider } from '../../contexts/user-context'
import { useAppTheme } from '../../theme/ThemeContext'
import { colors } from '../../theme/colors'

export default function TabLayout() {
  const { theme, isDark } = useAppTheme()

  return (
    <UserProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          borderTopColor: theme.border,
          backgroundColor: theme.background,
        },
        headerStyle: {
          backgroundColor: colors.forest[500],
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="bookmark" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="note-sticky" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="magnifying-glass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="gear" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </UserProvider>
  )
}
