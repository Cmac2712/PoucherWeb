import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import { useUpdateUser } from '@poucher/shared/api/hooks'
import { usePreferencesStore } from '@poucher/shared/store/preferences-store'
import { useAuth } from '../../contexts/auth-context'
import { useUser } from '../../contexts/user-context'
import { colors } from '../../theme/colors'

type ThemeOption = 'light' | 'dark'

export default function SettingsScreen() {
  const { user, logout } = useAuth()
  const { data: userData } = useUser()
  const updateUser = useUpdateUser()
  const theme = usePreferencesStore((s) => s.theme)
  const setTheme = usePreferencesStore((s) => s.setTheme)
  const displayName = usePreferencesStore((s) => s.displayName)
  const setDisplayName = usePreferencesStore((s) => s.setDisplayName)

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(displayName || userData?.user.name || '')

  const handleSaveName = async () => {
    if (!userData?.user.id || !nameInput.trim()) return

    setDisplayName(nameInput.trim())
    await updateUser.mutateAsync({
      id: userData.user.id,
      updates: { preferences: { displayName: nameInput.trim(), theme } },
    })
    setEditingName(false)
  }

  const handleThemeChange = async (newTheme: ThemeOption) => {
    setTheme(newTheme)
    if (userData?.user.id) {
      await updateUser.mutateAsync({
        id: userData.user.id,
        updates: { preferences: { theme: newTheme, displayName } },
      })
    }
  }

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: logout,
      },
    ])
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.row}>
          <Text style={styles.label}>Display Name</Text>
          {editingName ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.editInput}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                onSubmitEditing={handleSaveName}
              />
              {updateUser.isPending ? (
                <ActivityIndicator size="small" color={colors.forest[500]} />
              ) : (
                <Pressable onPress={handleSaveName}>
                  <Text style={styles.saveText}>Save</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable
              style={styles.editRow}
              onPress={() => {
                setNameInput(displayName || userData?.user.name || '')
                setEditingName(true)
              }}
            >
              <Text style={styles.value}>
                {displayName || userData?.user.name || 'Not set'}
              </Text>
              <FontAwesome6 name="pen" size={12} color={colors.gray[400]} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Appearance Section */}
      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.section}>
        {(['light', 'dark'] as const).map((option, index) => (
          <View key={option}>
            {index > 0 && <View style={styles.separator} />}
            <Pressable
              style={styles.row}
              onPress={() => handleThemeChange(option)}
            >
              <Text style={styles.label}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
              {theme === option && (
                <FontAwesome6 name="check" size={16} color={colors.forest[500]} />
              )}
            </Pressable>
          </View>
        ))}
      </View>

      {/* About Section */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>1.0.0</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.row}>
          <Text style={styles.label}>Made by</Text>
          <Text style={styles.value}>Craig</Text>
        </View>
      </View>

      {/* Logout */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome6 name="right-from-bracket" size={16} color={colors.red[500]} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginHorizontal: 16,
  },
  label: {
    fontSize: 16,
    color: colors.gray[900],
  },
  value: {
    fontSize: 16,
    color: colors.gray[500],
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editInput: {
    fontSize: 16,
    color: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 120,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.forest[500],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingVertical: 14,
    marginTop: 32,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.red[500],
  },
})
