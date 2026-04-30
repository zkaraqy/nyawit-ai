<script setup lang="ts">
import { ref, onMounted } from 'vue'

const currentToken = ref(3)
definePageMeta({
  layout: 'dashboard'
})

const packages = [
  { id: 1, name: 'Paket Starter', tokens: 10, price: 'Rp 50.000', popular: false, desc: 'Cocok untuk pemula.' },
  { id: 2, name: 'Paket Korporasi', tokens: 20, price: 'Rp 100.000', popular: true, desc: 'Pilihan tepat.' },
  { id: 3, name: 'Paket Enterprise', tokens: 50, price: 'Rp 250.000', popular: false, desc: 'Untuk ekspansi masif.' },
]

const transactions = ref<any[]>([])
const auth = useAuth()
const isLoading = ref(false)

const loadData = async () => {
  if (import.meta.server) return
  await auth.init()
  currentToken.value = auth.balance.value
  
  if (auth.token.value) {
    const historyRes = await $fetch<{ data: any[] }>('/api/v1/billing/history', {
      headers: { Authorization: `Bearer ${auth.token.value}` }
    }).catch(() => null)
    if (historyRes) transactions.value = historyRes.data
  }
}

onMounted(loadData)

const buyPackage = async (pkgId: number) => {
  isLoading.value = true
  try {
    const res = await $fetch<{ data: { snapToken: string, redirectUrl: string } }>('/api/v1/billing/topup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.token.value}` },
      body: { packageCount: pkgId }
    })
    
    // Simulate midtrans snap.pay
    if ((window as any).snap) {
      (window as any).snap.pay(res.data.snapToken, {
        onSuccess: () => loadData()
      })
    } else {
      window.location.href = res.data.redirectUrl
    }
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-8 max-w-6xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-2">
        <h1 class="text-2xl font-extrabold text-slate-800">Token & Billing</h1>
        <p class="text-slate-500">Kelola saldo token Anda untuk terus menikmati analisis AI tanpa hambatan.</p>
        <button @click="loadData" data-testid="billing-refresh-balance" class="text-sm bg-emerald-100 text-emerald-800 px-3 py-1 rounded">Refresh</button>
      </div>

      <div class="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
        <div class="absolute -right-6 -top-6 opacity-10">
          <Icon name="mdi:hexagon-multiple" class="text-[120px]" />
        </div>
        <div class="relative z-10 flex flex-col justify-between h-full">
          <div class="text-emerald-50 font-medium">Saldo Token Tersedia</div>
          <div class="flex items-end gap-3 mt-2">
            <span class="text-5xl font-extrabold">{{ currentToken }}</span>
            <span class="text-emerald-100 font-medium mb-1">Token</span>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <h2 class="text-xl font-bold text-slate-800">Beli Paket Token</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="pkg in packages" :key="pkg.id" 
          class="relative bg-white border-2 rounded-2xl p-6 transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col"
          :class="pkg.popular ? 'border-emerald-500 shadow-md shadow-emerald-500/10' : 'border-slate-100 hover:border-emerald-200'">
          
          <div v-if="pkg.popular" class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Paling Laris
          </div>

          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-slate-500 font-bold mb-1">{{ pkg.name }}</div>
              <div class="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
                {{ pkg.tokens }} <Icon name="mdi:hexagon-multiple" class="text-emerald-500 text-2xl" />
              </div>
            </div>
          </div>
          
          <p class="text-sm text-slate-500 mb-6 flex-1">{{ pkg.desc }}</p>
          
          <div class="mt-auto">
            <div class="text-xl font-bold text-slate-800 mb-4">{{ pkg.price }}</div>
            <button @click="buyPackage(pkg.id)" :data-testid="'billing-buy-package-' + pkg.id" :disabled="isLoading" class="w-full py-3 rounded-xl font-bold transition-all cursor-pointer"
              :class="pkg.popular ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'">
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-800">Riwayat Transaksi</h2>
      </div>
      
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-bold">
            <tr>
              <th class="p-5">Tipe</th>
              <th class="p-5">Jumlah</th>
              <th class="p-5">Status</th>
              <th class="p-5">Invoice MIDTRANS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-for="trx in transactions" :key="trx.id" class="hover:bg-slate-50 transition-colors">
              <td class="p-5 text-slate-500 font-medium">{{ trx.type }}</td>
              <td class="p-5 font-bold" :class="trx.type === 'topup' ? 'text-emerald-600' : 'text-red-500'">
                {{ trx.amount }}
              </td>
              <td class="p-5 text-slate-600 font-medium">{{ trx.status }}</td>
              <td class="p-5">{{ trx.midtransOrderId }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>