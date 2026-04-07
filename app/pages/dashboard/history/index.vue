<script setup lang="ts">
import { ref } from 'vue'
definePageMeta({
  layout: 'dashboard'
})

// Data dummy (mock data) untuk riwayat analisis
const histories = ref([
  {
    id: 'NYW-001',
    date: '12 Apr 2026',
    location: 'Kalimantan Tengah',
    coordinates: '-1.892, 113.342',
    area: 500,
    score: 88,
    status: 'Sangat Sesuai',
  },
  {
    id: 'NYW-002',
    date: '10 Apr 2026',
    location: 'Sumatera Utara',
    coordinates: '2.541, 99.123',
    area: 1200,
    score: 65,
    status: 'Cukup Sesuai',
  },
  {
    id: 'NYW-003',
    date: '05 Apr 2026',
    location: 'Riau',
    coordinates: '0.512, 101.444',
    area: 350,
    score: 42,
    status: 'Tidak Sesuai',
  }
])

const getStatusColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-red-100 text-red-700 border-red-200'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800">Riwayat Analisis</h1>
        <p class="text-slate-500 mt-1">Pantau dan kelola hasil evaluasi kelayakan lahan sawit Anda.</p>
      </div>
      <button class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-bold transition-all shadow-sm">
        <Icon name="mdi:filter-variant" class="text-lg" />
        Filter Data
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-bold uppercase tracking-wider">
              <th class="p-5">ID Analisis & Tanggal</th>
              <th class="p-5">Lokasi & Titik Koordinat</th>
              <th class="p-5">Luas Lahan</th>
              <th class="p-5">Skor AI & Status</th>
              <th class="p-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in histories" :key="item.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="p-5">
                <div class="font-bold text-slate-800">{{ item.id }}</div>
                <div class="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Icon name="mdi:calendar-clock" class="text-xs" />
                  {{ item.date }}
                </div>
              </td>
              <td class="p-5">
                <div class="font-bold text-slate-800">{{ item.location }}</div>
                <div class="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <Icon name="mdi:map-marker-outline" class="text-xs" />
                  {{ item.coordinates }}
                </div>
              </td>
              <td class="p-5">
                <div class="font-bold text-slate-800">{{ item.area }} Ha</div>
              </td>
              <td class="p-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    :class="item.score >= 80 ? 'bg-emerald-500 text-white' : item.score >= 60 ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'">
                    {{ item.score }}
                  </div>
                  <span class="px-2.5 py-1 text-xs font-bold rounded-lg border" :class="getStatusColor(item.score)">
                    {{ item.status }}
                  </span>
                </div>
              </td>
              <td class="p-5 text-right">
                <button class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                  Lihat Peta 3D
                  <Icon name="mdi:arrow-right" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="p-5 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 font-medium">
        <span>Menampilkan 1-3 dari 12 data</span>
        <div class="flex gap-1">
          <button class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 disabled:opacity-50"><Icon name="mdi:chevron-left" /></button>
          <button class="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 font-bold">1</button>
          <button class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">2</button>
          <button class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">3</button>
          <button class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100"><Icon name="mdi:chevron-right" /></button>
        </div>
      </div>
    </div>
  </div>
</template>