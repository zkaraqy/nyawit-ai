<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

interface HistoryItem {
  id: number
  province: string
  sizeHectares: number
  suitabilityScore: number
  createdAt: string
  resultMetadata?: {
    soilType?: string
    precipitationMs?: number
    recommendedCrops?: string[]
  }
}

const { data, pending, refresh } = await useApiFetch<{ data: HistoryItem[] }>('/api/v1/analysis/history', {
  default: () => ({ data: [] })
})

const cachedHistory = ref<HistoryItem[]>([])

// Restore cache from localStorage on mount
onMounted(() => {
  const stored = localStorage.getItem('analysisHistory')
  if (stored) {
    try {
      cachedHistory.value = JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to parse cached history', e)
    }
  }
})

// Save to localStorage whenever data changes
watch(
  () => data.value?.data,
  (items) => {
    if (Array.isArray(items) && items.length > 0) {
      cachedHistory.value = items
      localStorage.setItem('analysisHistory', JSON.stringify(items))
    }
  },
  { immediate: true }
)

const historyList = computed(() => {
  const items = data.value?.data

  if (Array.isArray(items)) {
    if (items.length > 0) return items
    // Show cache while pending or if data is empty
    return cachedHistory.value
  }

  return cachedHistory.value
})

const refreshHistory = async () => {
  await refresh()
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

</script>

<template>
  <div class="max-w-6xl mx-auto space-y-8">
    
    <div class="flex items-center justify-between gap-5">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Riwayat Analisis</h1>
        <p class="text-slate-500 mt-2">Daftar lahan yang telah Anda pindai dan petakan.</p>
      </div>
      <button class="bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" :disabled="pending" @click="refreshHistory()">
        <Icon name="mdi:refresh" :class="{ 'animate-spin': pending }" class="text-lg" />
        Segarkan
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="!pending && historyList.length === 0" class="bg-white border text-center border-slate-200 rounded-3xl p-16 shadow-sm">
      <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="mdi:archive-search-outline" class="text-5xl text-slate-300" />
      </div>
      <h2 class="text-xl font-bold text-slate-800 mb-2">Belum Ada Analisis</h2>
      <p class="text-slate-500 max-w-sm mx-auto mb-8">
        Anda belum memiliki riwayat analisis geospasial lahan. Silakan mulai analisis baru di menu Analisis Lahan.
      </p>
      <NuxtLink to="/dashboard" class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-500/20">
        <Icon name="mdi:plus-circle-outline" class="text-lg" />
        Mulai Analisis
      </NuxtLink>
    </div>

    <!-- Data list -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <NuxtLink :to="`/dashboard/analysis/${item.id}`" v-for="item in historyList" :key="item.id" class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden relative cursor-pointer block">
        
        <div class="absolute top-0 left-0 w-full h-1" 
             :class="item.suitabilityScore > 80 ? 'bg-emerald-500' : item.suitabilityScore > 60 ? 'bg-yellow-400' : 'bg-red-500'">
        </div>

        <div class="flex justify-between items-start mb-6 pt-2">
          <div>
            <h3 class="text-lg font-extrabold text-slate-800 line-clamp-1">{{ item.province }}</h3>
            <p class="text-sm font-medium text-slate-500 mt-1">{{ item.sizeHectares }} Hektar</p>
          </div>
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border-2"
               :class="item.suitabilityScore > 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : item.suitabilityScore > 60 ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-red-50 border-red-200 text-red-600'">
            {{ item.suitabilityScore }}
          </div>
        </div>

        <div class="space-y-4 mb-6">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
              <Icon name="mdi:sprout" class="text-slate-400 text-sm" />
            </div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Jenis Tanah</p>
              <p class="text-sm font-semibold text-slate-700">{{ item.resultMetadata?.soilType || '-' }}</p>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
              <Icon name="mdi:weather-pouring" class="text-slate-400 text-sm" />
            </div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Curah Hujan</p>
              <p class="text-sm font-semibold text-slate-700">{{ item.resultMetadata?.precipitationMs || '-' }} mm/tahun</p>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
              <Icon name="mdi:leaf" class="text-slate-400 text-sm" />
            </div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanaman Cocok</p>
              <p class="text-sm font-semibold text-slate-700 line-clamp-1">{{ item.resultMetadata?.recommendedCrops?.join(', ') || '-' }}</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-5 border-t border-slate-100">
          <span class="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Icon name="mdi:clock-outline" /> {{ formatDate(item.createdAt) }}
          </span>
        </div>

      </NuxtLink>
    </div>
    
  </div>
</template>
