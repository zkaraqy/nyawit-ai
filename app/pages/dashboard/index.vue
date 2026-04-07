<script setup lang="ts">
import { ref } from 'vue'
definePageMeta({
  layout: 'dashboard'
})

// --- State Management ---
const tokenBalance = ref(3) // Nanti hubungkan dengan state global yang sama di layout
const landSize = ref<number | null>(null)
const selectedProvince = ref('')
const isAnalyzing = ref(false)
const analysisResult = ref<any>(null)

const provinces = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi',
  'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung',
  'Kepulauan Riau', 'Kalimantan Barat', 'Kalimantan Tengah',
  'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Papua', 'Papua Barat'
]

// --- Core Functions ---
const handleAnalyze = () => {
  if (!landSize.value || !selectedProvince.value) return
  
  if (tokenBalance.value <= 0) {
    alert('Saldo token habis! Silakan lakukan Top-Up.')
    return
  }

  isAnalyzing.value = true
  
  setTimeout(() => {
    tokenBalance.value -= 1 
    isAnalyzing.value = false
    
    analysisResult.value = {
      score: 87,
      heatmapColor: 'bg-emerald-500', 
      status: 'Sangat Layak',
      catalog: {
        soilType: 'Ultisol / Podsolik Merah Kuning',
        elevation: '50 - 150 mdpl',
        rainfall: '2.000 - 2.500 mm/tahun',
        slope: 'Datar hingga Bergelombang (0-8%)'
      }
    }
  }, 2000)
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

    <!-- STATE 3: Result Output -->
    <div v-else-if="analysisResult" class="animate-fade-in-up space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-display font-bold text-slate-900">Hasil Analisis Geospasial</h2>
          <p class="text-slate-500 text-sm">Target: <span class="font-semibold text-slate-700">{{ selectedProvince }}</span> &bull; Luas: <span class="font-semibold text-slate-700">{{ landSize }} Ha</span></p>
        </div>
        <button @click="resetScan" class="px-5 py-2.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
          <Icon name="mdi:magnify-plus-outline" class="text-lg" /> Pindai Area Lain
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Peta 3D (Kiri) -->
        <div class="lg:col-span-2 bg-slate-900 rounded-2xl overflow-hidden relative min-h-[450px] shadow-lg border border-slate-800">
          <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <div class="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            <Icon name="mdi:earth" class="text-6xl text-emerald-500/50 mb-2" />
            <p class="text-white/60 font-medium">[ Mapbox/CesiumJS Render Area ]</p>
          </div>

          <div class="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur rounded-xl p-4 shadow-xl border border-white/20">
            <p class="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">Heatmap AI</p>
            <div class="flex flex-col gap-2 text-xs font-medium text-slate-600">
              <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-sm bg-emerald-500"></div> Sangat Cocok</div>
              <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-sm bg-yellow-400"></div> Marginal</div>
              <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-sm bg-red-500"></div> Tidak Direkomendasikan</div>
            </div>
          </div>
        </div>

        <!-- Skor & Katalog (Kanan) -->
        <div class="space-y-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Skor Kesesuaian Lahan</h3>
            <div class="relative w-32 h-32 flex items-center justify-center mb-4">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="12" fill="transparent" class="text-slate-100" />
                <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="12" fill="transparent" :stroke-dasharray="351" :stroke-dashoffset="351 - (351 * analysisResult.score) / 100" class="text-emerald-500 transition-all duration-1000" stroke-linecap="round" />
              </svg>
              <span class="absolute text-3xl font-display font-extrabold text-slate-800">{{ analysisResult.score }}<span class="text-lg text-slate-400">%</span></span>
            </div>
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100">
              <div :class="`w-2.5 h-2.5 rounded-full ${analysisResult.heatmapColor} animate-pulse`"></div>
              {{ analysisResult.status }}
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Icon name="mdi:book-open-page-variant-outline" class="text-emerald-600" /> Info Topografi
            </h3>
            <ul class="space-y-4">
              <li class="flex justify-between items-center border-b border-slate-100 pb-3">
                <span class="text-sm text-slate-500 flex items-center gap-2"><Icon name="mdi:terrain" class="text-slate-400" /> Elevasi</span>
                <span class="text-sm font-semibold text-slate-800">{{ analysisResult.catalog.elevation }}</span>
              </li>
              <li class="flex justify-between items-center border-b border-slate-100 pb-3">
                <span class="text-sm text-slate-500 flex items-center gap-2"><Icon name="mdi:chart-bell-curve" class="text-slate-400" /> Kelerengan</span>
                <span class="text-sm font-semibold text-slate-800">{{ analysisResult.catalog.slope }}</span>
              </li>
              <li class="flex justify-between items-center border-b border-slate-100 pb-3">
                <span class="text-sm text-slate-500 flex items-center gap-2"><Icon name="mdi:weather-pouring" class="text-slate-400" /> Curah Hujan</span>
                <span class="text-sm font-semibold text-slate-800">{{ analysisResult.catalog.rainfall }}</span>
              </li>
              <li class="flex justify-between items-center">
                <span class="text-sm text-slate-500 flex items-center gap-2"><Icon name="mdi:sprout" class="text-slate-400" /> Jenis Tanah</span>
                <span class="text-sm font-semibold text-slate-800 text-right w-1/2">{{ analysisResult.catalog.soilType }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>