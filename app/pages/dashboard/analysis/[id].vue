<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

const route = useRoute()
const id = route.params.id as string

const { data, pending, error } = await useApiFetch<any>(`/api/v1/analysis/${id}`)

const rData = computed(() => data.value?.data)

const getStatus = (score: number) => {
  if (score > 80) return 'Sangat Layak'
  if (score > 60) return 'Marginal (Perlu Perawatan)'
  return 'Tidak Direkomendasikan'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(dateStr))
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/dashboard/history" class="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-all shadow-sm">
        <Icon name="mdi:arrow-left" class="text-xl" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Detail Analisis Lahan</h1>
        <p class="text-slate-500 text-sm mt-1">ID Scan: #{{ id }}</p>
      </div>
    </div>

    <div v-if="pending" class="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
      <Icon name="mdi:loading" class="animate-spin text-4xl text-emerald-500 mx-auto mb-4" />
      <p class="text-slate-500">Membaca data geospasial...</p>
    </div>

    <div v-else-if="error || !rData" class="bg-red-50 rounded-3xl p-12 text-center border border-red-100 shadow-sm">
      <Icon name="mdi:alert-circle" class="text-4xl text-red-500 mx-auto mb-4" />
      <p class="text-red-600 font-medium">Gagal memuat detail analisis</p>
      <p class="text-red-400 text-sm mt-2">{{ error?.message || 'Data tidak ditemukan' }}</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Kiri: Peta dan Visual -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- Komponen Map 3D -->
        <div class="bg-white p-2 rounded-4xl border border-slate-200 shadow-sm h-[500px]">
          <ResultMap3D 
            :province="rData.province" 
            :score="rData.suitabilityScore" 
            :size-hectares="rData.sizeHectares" 
            :geo-json-data="rData.resultMetadata?.geoJsonData"
            class="rounded-3xl"
          />
        </div>

        <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Icon name="mdi:chart-timeline-variant-shimmer" class="text-emerald-500" />
            Parameter Kesesuaian Metrik
          </h2>
          <div class="grid grid-cols-2 gap-6">
             <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <span class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 block">Tipe Tanah</span>
               <p class="font-bold text-slate-800">{{ rData.resultMetadata.soilType }}</p>
             </div>
             <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <span class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 block">Curah Hujan Tahunan</span>
               <p class="font-bold text-slate-800">{{ rData.resultMetadata.precipitationMs }} mm</p>
             </div>
             <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <span class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 block">Elevasi Lahan</span>
               <p class="font-bold text-slate-800">{{ rData.resultMetadata.elevationRange }}</p>
             </div>
             <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <span class="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1 block">Rekomendasi Utama</span>
               <p class="font-bold text-emerald-600 line-clamp-1">{{ rData.resultMetadata.recommendedCrops.join(', ') }}</p>
             </div>
          </div>
        </div>
      </div>

      <!-- Kanan: Resume dan Scoring -->
      <div class="space-y-6">
        
        <!-- Score Card -->
        <div class="bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-800/20 text-white relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          
          <p class="text-slate-400 text-sm font-semibold mb-2">Skor Kesesuaian Lahan</p>
          <div class="flex items-end gap-3 mb-6">
            <h2 class="text-6xl font-black" :class="rData.suitabilityScore > 80 ? 'text-emerald-400' : rData.suitabilityScore > 60 ? 'text-yellow-400' : 'text-red-400'">
              {{ rData.suitabilityScore }}
            </h2>
            <span class="text-xl font-bold text-slate-500 mb-1.5">/ 100</span>
          </div>
          
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/10 backdrop-blur-sm border border-white/10">
            <Icon :name="rData.suitabilityScore > 80 ? 'mdi:check-decagram' : rData.suitabilityScore > 60 ? 'mdi:alert-decagram' : 'mdi:close-octagon'" 
                  :class="rData.suitabilityScore > 80 ? 'text-emerald-400' : rData.suitabilityScore > 60 ? 'text-yellow-400' : 'text-red-400'" class="text-lg"/>
            {{ getStatus(rData.suitabilityScore) }}
          </div>

          <div class="mt-8 pt-6 border-t border-slate-700/50">
            <p class="text-xs text-slate-400 mb-1">Dianalisis pada:</p>
            <p class="text-sm font-medium text-slate-300">{{ formatDate(rData.createdAt) }}</p>
          </div>
        </div>

        <!-- Risks Analysis -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
           <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Icon name="mdi:shield-alert-outline" class="text-red-500" />
             Potensi Risiko
           </h3>
           <ul class="space-y-4">
             <li v-for="(risk, i) in rData.resultMetadata.risks" :key="i" class="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
               <span class="text-slate-600 font-medium flex items-center gap-2">
                 <Icon name="mdi:hazard-lights" class="text-slate-400" />
                 {{ risk.type }}
               </span>
               <span class="text-xs font-bold px-3 py-1 rounded-lg"
                     :class="risk.probability === 'Tinggi' ? 'bg-red-100 text-red-700' : risk.probability === 'Sedang' ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'">
                 {{ risk.probability }}
               </span>
             </li>
           </ul>
        </div>
        
        <!-- Action -->
        <button class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-6 rounded-2xl transition-all flex justify-center items-center gap-2">
          <Icon name="mdi:download" class="text-lg" />
          Download Laporan PDF
        </button>

      </div>

    </div>
  </div>
</template>
