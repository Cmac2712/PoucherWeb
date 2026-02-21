import { Stack } from 'expo-router'
import { colors } from '../../../theme/colors'

export default function BookmarksLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Bookmarks',
          headerStyle: { backgroundColor: colors.forest[500] },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Stack.Screen
        name="tags"
        options={{
          title: 'Manage Tags',
          headerStyle: { backgroundColor: colors.forest[500] },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </Stack>
  )
}
