<script setup lang="ts">
import { onMounted, ref } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

const tokenService = useToken()
const auth = useAuth()
const config = useRuntimeConfig()

// Load Midtrans Snap JS
useHead({
  script: [
    {
      src: 'https://app.sandbox.midtrans.com/snap/snap.js',
      'data-client-key': process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-xxxxx',
      // In production use https://app.midtrans.com/snap/snap.js
    }
  ]
})

const packages = [
  { id: 1, title: 'Paket Dasar', tokens: 10, price: 50000 },
  { id: 2, title: 'Paket Pro', tokens: 50, price: 200000, popular: true },
  { id: 3, title: 'Paket Enterprise', tokens: 100, price: 350000 },
]

onMounted(() => {
  tokenService.fetchHistory()
  tokenService.refreshBalance()
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

async function buyPackage(pkgCount: number) {
  const res = await tokenService.requestTopup(pkgCount)
  if (res.success && 'data' in res && res.data.snapToken) {
    // @ts-ignore
    if (window.snap) {
      // @ts-ignore
      window.snap.pay(res.data.snapToken, {
        onSuccess: function (result: any) {
          console.log('Payment success', result)
          tokenService.refreshBalance()
          tokenService.fetchHistory()
        },
        onPending: function (result: any) {
          console.log('Payment pending', result)
          tokenService.fetchHistory()
        },
        onError: function (result: any) {
          console.error('Payment error', result)
          tokenService.fetchHistory()
        },
        onClose: function () {
          console.log('Payment popup closed')
          tokenService.fetchHistory()
        }
      })
    }
  } else {
    alert(('message' in res ? res.message : '') || 'Gagal memulai pembayaran.')
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-8">
    
    <div>
      <h1 class="text-3xl font-bold text-slate-800">Token & Billing</h1>
      <p class="text-slate-500 mt-2">Kelola saldo token analisis dan riwayat transaksi akun Anda.</p>
    </div>

    <!-- Saldo & Status Card -->
    <div class="relative bg-linear-to-br from-emerald-600 to-emerald-800 rounded-3xl p-8 overflow-hidden shadow-xl shadow-emerald-900/20 text-white">
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/10 blur-3xl rounded-full"/>
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p class="text-emerald-100 font-medium mb-1">Saldo Token Analisis</p>
          <div class="flex items-end gap-3">
            <span class="text-6xl font-black">{{ auth.balance.value }}</span>
            <span class="text-emerald-200 text-lg mb-2">Token</span>
          </div>
          <p class="text-emerald-100/70 text-sm mt-3">
            Satu token digunakan untuk satu kali pemindaian kawasan mandiri.
          </p>
        </div>
        
        <button @click="tokenService.refreshBalance()" class="self-start md:self-auto bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer text-nowrap">
          <Icon name="mdi:refresh" class="text-xl" :class="{ 'animate-spin': tokenService.isFetchingHistory.value }" />
          Segarkan Saldo
        </button>
      </div>
    </div>

    <!-- Pilihan Paket Topup -->
    <div>
      <h2 class="text-xl font-bold text-slate-800 mb-6">Top Up Token</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          v-for="pkg in packages" :key="pkg.id"
          class="relative bg-white rounded-3xl p-6 border-2 transition-all hover:-translate-y-1 hover:shadow-xl group"
          :class="pkg.popular ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-slate-100 hover:border-emerald-200'"
        >
          <div v-if="pkg.popular" class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest text-nowrap">
            Paling Laris
          </div>
          
          <h3 class="text-lg font-bold text-slate-700 text-center">{{ pkg.title }}</h3>
          <div class="my-6 text-center">
            <div class="text-4xl font-black text-emerald-600 flex items-center justify-center gap-2">
              {{ pkg.tokens }} <Icon name="mdi:hexagon-multiple" class="text-2xl text-emerald-400" />
            </div>
            <p class="text-slate-400 font-medium mt-1">Token Analisis</p>
          </div>
          
          <div class="text-center mb-6">
            <p class="text-2xl font-bold text-slate-800">{{ formatCurrency(pkg.price) }}</p>
          </div>
          
          <button 
            @click="buyPackage(pkg.id)" 
            :disabled="tokenService.isCharging.value"
            class="w-full py-3.5 rounded-xl font-bold transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :class="pkg.popular ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700'"
          >
            Beli Sekarang
            <Icon name="mdi:arrow-right" />
          </button>
        </div>
      </div>
    </div>

    <!-- Riwayat Transaksi -->
    <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-800">Riwayat Transaksi</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <th class="py-4 px-6 font-semibold w-[200px]">Tanggal</th>
              <th class="py-4 px-6 font-semibold">Tipe</th>
              <th class="py-4 px-6 font-semibold">Deskripsi</th>
              <th class="py-4 px-6 font-semibold text-right">Jumlah</th>
              <th class="py-4 px-6 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody v-if="tokenService.transactions.value.length > 0">
            <tr v-for="tx in tokenService.transactions.value" :key="tx.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td class="py-4 px-6 text-slate-600 text-sm font-medium">
                {{ formatDate(tx.createdAt) }}
              </td>
              <td class="py-4 px-6">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold"
                  :class="tx.type === 'topup' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-red-50 text-red-600 border border-red-100'">
                  <Icon :name="tx.type === 'topup' ? 'mdi:arrow-bottom-left-thick' : 'mdi:arrow-top-right-thick'" />
                  {{ tx.type === 'topup' ? 'Top up' : 'Penggunaan' }}
                </span>
              </td>
              <td class="py-4 px-6 text-slate-700 font-medium">
                {{ tx.description || 'Transaksi Token' }}
              </td>
              <td class="py-4 px-6 text-right font-bold text-lg" :class="tx.type === 'topup' ? 'text-blue-600' : 'text-red-600'">
                {{ tx.type === 'topup' ? '+' : '-' }}{{ tx.amount }}
              </td>
              <td class="py-4 px-6">
                <div class="flex justify-center">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                    :class="{
                      'bg-emerald-50 text-emerald-600 border-emerald-100': tx.status === 'success',
                      'bg-amber-50 text-amber-600 border-amber-100': tx.status === 'pending',
                      'bg-rose-50 text-rose-600 border-rose-100': tx.status === 'failed'
                    }">
                    <Icon :name="tx.status === 'success' ? 'mdi:check-circle' : tx.status === 'pending' ? 'mdi:clock-outline' : 'mdi:close-circle'" />
                    {{ tx.status === 'success' ? 'Berhasil' : tx.status === 'pending' ? 'Tertunda' : 'Gagal' }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="!tokenService.isFetchingHistory.value">
            <tr>
              <td colspan="5" class="py-12 text-center text-slate-500">
                <div class="flex flex-col items-center justify-center gap-3">
                  <Icon name="mdi:history" class="text-4xl text-slate-300" />
                  <p class="font-medium">Belum ada riwayat transaksi token.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
