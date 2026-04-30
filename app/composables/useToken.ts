import { readonly, ref } from 'vue'

export interface TransactionHistory {
  id: number
  userId: number
  amount: number
  type: 'topup' | 'deduct'
  status: 'pending' | 'success' | 'failed'
  description: string | null
  midtransOrderId: string | null
  createdAt: string
}

export const useToken = () => {
  const auth = useAuth()
  
  const isCharging = ref(false)
  const isFetchingHistory = ref(false)
  const transactions = ref<TransactionHistory[]>([])

  /** Refresh the current token balance */
  async function refreshBalance() {
    if (!auth.isAuthenticated.value) return 0
    
    try {
      const response = await $fetch<{ success: boolean; data: { balance: number } }>('/api/v1/billing/balance', {
        headers: auth.getAuthHeaders(),
      })
      
      if (response.success) {
        auth.setBalance(response.data.balance)
        return response.data.balance
      }
    } catch (e) {
      console.error('Failed to fetch balance', e)
    }
    return auth.balance.value
  }

  /** Deduct local auth state explicitly if an internal mechanism uses tokens without polling */
  async function deductTokenInternal(amount: number = 1) {
    if (auth.balance.value >= amount) {
      auth.setBalance(auth.balance.value - amount)
    }
  }

  /** Get transaction history */
  async function fetchHistory() {
    if (!auth.isAuthenticated.value) return []
    
    isFetchingHistory.value = true
    try {
      const response = await $fetch<{ success: boolean; data: TransactionHistory[] }>('/api/v1/billing/history', {
        headers: auth.getAuthHeaders(),
      })
      
      if (response.success) {
        transactions.value = response.data
      }
    } catch (e) {
      console.error('Failed to fetch history', e)
    } finally {
      isFetchingHistory.value = false
    }
    
    return transactions.value
  }

  /** Request top-up via Midtrans Snap */
  async function requestTopup(pkgId: number) {
    if (!auth.isAuthenticated.value) return { success: false, message: 'Harap login' }
    
    isCharging.value = true
    try {
      const response = await $fetch<{ success: boolean; data: { snapToken: string; redirectUrl: string } }>('/api/v1/billing/topup', {
        method: 'POST',
        headers: auth.getAuthHeaders(),
        body: { pkgId },
      })
      
      return response
    } catch (error: any) {
      console.error('Topup request failed', error)
      return { 
        success: false, 
        message: error?.data?.message || 'Gagal memulai proses pembayaran'
      }
    } finally {
      isCharging.value = false
    }
  }

  return {
    transactions: readonly(transactions),
    isFetchingHistory: readonly(isFetchingHistory),
    isCharging: readonly(isCharging),
    
    refreshBalance,
    deductTokenInternal,
    fetchHistory,
    requestTopup,
  }
}
