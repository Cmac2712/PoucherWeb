import { Tabs } from 'expo-router'
import { FontAwesome6 } from '@expo/vector-icons'
import { UserProvider } from '../../contexts/user-context'
import { colors } from '../../theme/colors'

export default function TabLayout() {
  return (
    <UserProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.forest[500],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          borderTopColor: colors.gray[200],
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
        name="index"
        options={{
          title: 'Bookmarks',
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
