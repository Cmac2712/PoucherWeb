import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useAuth } from '../../contexts/auth-context'
import { colors } from '../../theme/colors'

export default function ConfirmScreen() {
  const router = useRouter()
  const { email } = useLocalSearchParams<{ email: string }>()
  const { confirmSignUp } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!code) {
      setError('Please enter the verification code')
      return
    }

    if (!email) {
      setError('Email address is missing')
      return
    }

    setError('')
    setLoading(true)

    try {
      await confirmSignUp(email, code.trim())
      router.replace('/(auth)/login')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Confirmation failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.heading}>Check your email</Text>
          <Text style={styles.description}>
            We sent a verification code to{' '}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor={colors.gray[400]}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoFocus
            textContentType="oneTimeCode"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.linkButton}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.linkText}>Back to login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  form: {
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: colors.gray[500],
    lineHeight: 22,
    marginBottom: 32,
  },
  email: {
    fontWeight: '600',
    color: colors.gray[700],
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: '600',
    color: colors.gray[900],
    backgroundColor: colors.white,
    marginBottom: 16,
    letterSpacing: 8,
    textAlign: 'center',
  },
  error: {
    color: colors.red[500],
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.forest[500],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    fontSize: 14,
    color: colors.forest[500],
    fontWeight: '600',
  },
})
