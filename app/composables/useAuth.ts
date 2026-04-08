interface AuthUser {
  id: number
  email: string
  fullName: string
  companyName: string | null
  createdAt?: Date
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  balance: number
  isAuthenticated: boolean
  isLoading: boolean
}

const TOKEN_KEY = 'nyawit_auth_token'

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth_user', () => null)
  const token = useState<string | null>('auth_token', () => null)
  const balance = useState<number>('auth_balance', () => 0)
  const isLoading = useState<boolean>('auth_loading', () => false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  /** Initialize auth state from stored token */
  async function init() {
    if (import.meta.server) return

    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) return

    token.value = storedToken
    try {
      await fetchMe()
    } catch {
      // Token expired or invalid — clear it
      logout()
    }
  }

  /** Fetch current user from /api/auth/me */
  async function fetchMe() {
    if (!token.value) return

    const response = await $fetch<{ success: boolean; data: { user: AuthUser; balance: number } }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${token.value}` },
    })

    if (response.success) {
      user.value = response.data.user
      balance.value = response.data.balance
    }
  }

  /** Login with email and password */
  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      const response = await $fetch<{
        success: boolean
        message: string
        data: { token: string; user: AuthUser; balance: number }
      }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      token.value = response.data.token
      user.value = response.data.user
      balance.value = response.data.balance

      // Persist token
      localStorage.setItem(TOKEN_KEY, response.data.token)

      return { success: true, message: response.message }
    } catch (error: any) {
      const message = error?.data?.message || 'Login gagal'
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /** Register a new account */
  async function register(data: { email: string; password: string; fullName: string; companyName?: string }) {
    isLoading.value = true
    try {
      const response = await $fetch<{
        success: boolean
        message: string
        data: { token: string; user: AuthUser }
      }>('/api/auth/register', {
        method: 'POST',
        body: data,
      })

      return { success: true, message: response.message }
    } catch (error: any) {
      const message = error?.data?.message || 'Registrasi gagal'
      return { success: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /** Logout and clear all state */
  function logout() {
    user.value = null
    token.value = null
    balance.value = 0

    if (import.meta.client) {
      localStorage.removeItem(TOKEN_KEY)
    }

    navigateTo('/login')
  }

  /** Get the authorization header for API calls */
  function getAuthHeaders(): Record<string, string> {
    if (!token.value) return {}
    return { Authorization: `Bearer ${token.value}` }
  }

  /** Update balance reactively (used by token composable) */
  function setBalance(newBalance: number) {
    balance.value = newBalance
  }

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    balance,
    isAuthenticated,
    isLoading: readonly(isLoading),
    // Actions
    init,
    fetchMe,
    login,
    register,
    logout,
    getAuthHeaders,
    setBalance,
  }
}
