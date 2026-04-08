<script setup lang="ts">
import { ref } from 'vue'
definePageMeta({
  layout: 'dashboard'
})

const auth = useAuth()
const tokenService = useToken()

const landSize = ref<number | null>(null)
const selectedProvince = ref('')
const isAnalyzing = ref(false)
const analysisResult = ref<any>(null)

// Refresh balance on mount
onMounted(() => {
  tokenService.refreshBalance()
})

const provinces = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi',
  'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung',
  'Kepulauan Riau', 'Kalimantan Barat', 'Kalimantan Tengah',
  'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Papua', 'Papua Barat'
]

const handleAnalyze = async () => {
  if (!landSize.value || !selectedProvince.value) return
  
  if (auth.balance.value <= 0) {
    alert('Saldo token habis! Silakan lakukan Top-Up.')
    return
  }

  isAnalyzing.value = true
  
  try {
    const res = await $api('/api/v1/analysis/scan', {
      method: 'POST',
      body: {
        province: selectedProvince.value,
        sizeHectares: landSize.value
      }
    })

    if (res.success) {
      const data = res.data
      
      // Update balance
      tokenService.refreshBalance()
      tokenService.fetchHistory()

      if(!data || !data.id) {
        alert('Analisis selesai, namun tidak ada data yang dapat ditampilkan.')
        isAnalyzing.value = false
        return;
      }

      await navigateTo(`/dashboard/analysis/${data.id}`)
    } else {
      alert(res.message || 'Analisis gagal.')
    }
  } catch (error: any) {
    alert(error.data?.message || 'Gagal melakukan analisis')
  } finally {
    isAnalyzing.value = false
  }
}


const resetScan = () => {
  analysisResult.value = null
  landSize.value = null
  selectedProvince.value = ''
}
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto w-full">
    
    <!-- Header Halaman -->
    <div class="mb-8">
      <h1 class="text-2xl font-display font-bold text-slate-900">Mulai Analisis Baru</h1>
      <p class="text-slate-500 mt-1">Masukkan parameter lahan untuk melihat proyeksi kelayakan tanam.</p>
    </div>

    <!-- STATE 1: Input Form -->
    <div v-if="!analysisResult && !isAnalyzing" class="animate-fade-in-up flex flex-col lg:flex-row gap-8">
      
      <!-- Form Panel -->
      <div class="w-full lg:w-1/3 space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
          <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Icon name="mdi:target" class="text-emerald-600" /> Parameter Target
          </h2>
          <form @submit.prevent="handleAnalyze" class="space-y-5">
            <div class="space-y-1.5">
              <label class="text-sm font-semibold text-slate-700">Provinsi</label>
              <select v-model="selectedProvince" class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" required>
                <option value="" disabled>Pilih provinsi...</option>
                <option v-for="prov in provinces" :key="prov" :value="prov">{{ prov }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-semibold text-slate-700">Luas Lahan (Hektar)</label>
              <input v-model="landSize" type="number" placeholder="Contoh: 1500" class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" required />
            </div>
            
            <div class="pt-2">
              <button type="submit" class="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex justify-center items-center gap-2">
                Proses Area 
                <span class="text-xs bg-emerald-800 px-2 py-0.5 rounded-full ml-1">-1 Token</span>
              </button>
            </div>
          </form>
        </div>
        
        <!-- Info Banner -->
        <div class="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <div class="flex gap-3">
            <Icon name="mdi:information" class="text-blue-500 text-xl shrink-0" />
            <p class="text-xs text-blue-800 leading-relaxed font-medium">
              Sistem akan memotong 1 Token untuk setiap analisis yang berhasil. Pastikan target provinsi dan luasan lahan akurat.
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State Map -->
      <div class="w-full lg:w-2/3 bg-slate-200/50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 min-h-[450px]">
        <Icon name="mdi:map-search-outline" class="text-6xl mb-4 text-slate-300" />
        <p class="font-medium text-slate-500">Area Visualisasi 3D</p>
        <p class="text-sm">Silakan masukkan parameter di panel kiri untuk memulai render.</p>
      </div>
    </div>

    <!-- STATE 2: Loading State -->
    <div v-else-if="isAnalyzing" class="w-full h-[60vh] flex flex-col items-center justify-center space-y-6">
      <Loading description="Menganalisis data satelit untuk lahan {{ landSize }} Ha di {{ selectedProvince }}." />
    </div>

  </div>
</template>