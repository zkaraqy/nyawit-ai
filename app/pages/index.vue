<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'

const landSize = ref<number | null>(null)
const selectedProvince = ref('')
const email = ref('')

const provinces = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi',
  'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung',
  'Kepulauan Riau', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah',
  'DI Yogyakarta', 'Jawa Timur', 'Banten', 'Bali', 'Nusa Tenggara Barat',
  'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah',
  'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan',
  'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat', 'Maluku',
  'Maluku Utara', 'Papua Barat', 'Papua'
]

const analysisLoading = ref(false)
const appLoading = ref(true)
const waitlistLoading = ref(false)

onMounted(() => {
  // Simulate loading mainly for the 3D assets visual
  setTimeout(() => {
    appLoading.value = false
  }, 2000)
})

const handleAnalyze = () => {
  if (!landSize.value || !selectedProvince.value) return

  analysisLoading.value = true
  setTimeout(() => {
    analysisLoading.value = false
    alert('Analisis started for ' + selectedProvince.value)
  }, 1500)
}

const joinWaitlist = async () => {
  if (!email.value) return
  await handleCreateWaitlist()
}

const isOpen = ref(false)

function closeModal() {
  isOpen.value = false
}
function openModal() {
  isOpen.value = true
}

async function handleCreateWaitlist() {
  if (!email.value) return

  waitlistLoading.value = true
  try {
    const response = await $fetch<ApiResponse<null>>('/api/waitlist', {
      method: 'POST',
      body: { email: email.value }
    })

    if (response.success) {
      openModal()
      email.value = ''
    } else {
      console.error('Gagal mendaftar ke waitlist: ' + response.message)
    }
  } catch (error) {
    console.error('Terjadi kesalahan saat mendaftar ke waitlist.')
  } finally {
    waitlistLoading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900">
    <!-- Loading Screen -->
    <div v-if="appLoading">
      <Loading description="Memuat Peta Interaktif...'" />
    </div>

    <!-- Navbar -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-emerald-900/95 border-b border-white/10 shadow-lg shadow-emerald-900/20 overflow-hidden">
      <!-- Palm Ornaments Background -->
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="palm-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20,20 Q25,5 35,5 Q25,10 20,20 Q15,30 5,30 Q15,25 20,20" fill="none" stroke="currentColor"
                stroke-width="1.5" class="text-white" />
              <path d="M20,20 Q15,35 5,35 Q15,30 20,20 Q25,10 35,10 Q25,15 20,20" fill="none" stroke="currentColor"
                stroke-width="1.5" class="text-white" transform="rotate(180 20 20)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#palm-pattern)" />
        </svg>
      </div>

      <div class="flex items-center gap-2 relative z-10">
        <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
          <Icon name="mdi:leaf" class="text-emerald-400 text-xl" />
        </div>
        <span class="text-xl font-display font-bold tracking-tight text-white">NyawitAI</span>
      </div>
      <button
        class="relative cursor-pointer z-10 px-5 py-2 text-sm font-bold text-emerald-900 bg-white rounded-full hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
        Masuk / Daftar
      </button>
    </nav>

    <!-- Hero Section -->
    <section class="relative w-full min-h-screen lg:h-screen overflow-hidden flex items-center pt-24 lg:pt-10">

      <!-- Overlay Gradient -->
      <div
        class="absolute inset-0 z-10 bg-linear-to-r from-slate-50/90 via-slate-50/60 to-transparent pointer-events-none">
      </div>

      <!-- Floating Dots Animation -->
      <div class="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div v-for="n in 5" :key="n" class="absolute bg-emerald-400/20 rounded-full blur-xl animate-float" :style="{
          width: Math.random() * 100 + 50 + 'px',
          height: Math.random() * 100 + 50 + 'px',
          top: Math.random() * 80 + 10 + '%',
          left: Math.random() * 80 + 10 + '%',
          animationDelay: Math.random() * 5 + 's',
          animationDuration: Math.random() * 10 + 10 + 's'
        }"></div>
      </div>

      <!-- Content -->
      <div
        class="relative z-20 w-full max-w-7xl mx-auto px-6 flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center h-full">

        <!-- Left Column: Text & Form -->
        <div class="space-y-2 animate-fade-in-up order-2 lg:order-1 w-full pb-10 lg:pb-0">
          <div class="space-y-4">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Icon name="mdi:star-four-points" />
              AI-Powered Investment
            </div>
            <h1 class="text-4xl lg:text-5xl font-display font-extrabold text-slate-900 leading-tight tracking-tight">
              Investasi Sawit <br />
              <span class="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500">Cerdas &
                Terukur</span>
            </h1>
            <p class="text-lg text-slate-600 max-w-lg leading-relaxed">
              Cari lahan kelapa sawit optimal dengan analisis AI mendalam, peta 3D interaktif, dan proyeksi
              finansial akurat untuk hasil maksimal.
            </p>
          </div>

          <!-- Glassmorphism Form Card -->
          <div
            class="p-6 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-2xl shadow-emerald-900/5 max-w-md w-full">
            <form @submit.prevent="handleAnalyze" class="space-y-5">
              <div class="space-y-1.5">
                <label class="text-sm font-semibold text-slate-700 block ml-1">Luas Lahan (Hektar)</label>
                <div class="relative group">
                  <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Icon name="mdi:land-plots" class="text-lg" />
                  </div>
                  <input v-model="landSize" type="number" placeholder="Contoh: 50"
                    class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400 font-sans"
                    required />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-semibold text-slate-700 block ml-1">Pilih Provinsi</label>
                <div class="relative group">
                  <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Icon name="mdi:map-marker-radius" class="text-lg" />
                  </div>
                  <select v-model="selectedProvince"
                    class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none text-slate-700 disabled:opacity-50 font-sans"
                    required>
                    <option value="" disabled selected>Pilih lokasi provinsi...</option>
                    <option v-for="prov in provinces" :key="prov" :value="prov">{{ prov }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                    <Icon name="mdi:chevron-down" />
                  </div>
                </div>
              </div>

              <button type="submit" :disabled="analysisLoading"
                class="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/30 transform transition-all active:scale-[0.98] flex justify-center items-center gap-2 group cursor-pointer">
                <span v-if="!analysisLoading">Mulai Analisis Sekarang</span>
                <span v-else>Memproses Data...</span>
                <Icon v-if="!analysisLoading" name="mdi:arrow-right"
                  class="group-hover:translate-x-1 transition-transform" />
                <Icon v-else name="svg-spinners:180-ring" />
              </button>
            </form>
          </div>
        </div>

        <!-- Right Column: Interactive Area (Map) -->
        <div
          class="w-full h-[400px] relative pointer-events-auto lg:-mr-20 bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl shadow-emerald-900/20 border border-white/50 overflow-hidden order-1 lg:order-2 top-0">
          <ClientOnly>
            <HeroMap3D />
          </ClientOnly>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="py-12 bg-emerald-900 text-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-10 pattern-grid-lg"></div>
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
        <div class="space-y-1">
          <div class="text-4xl lg:text-5xl font-display font-bold text-emerald-400">34</div>
          <div class="text-sm font-medium text-emerald-100 uppercase tracking-widest">Provinsi</div>
        </div>
        <div class="space-y-1">
          <div class="text-4xl lg:text-5xl font-display font-bold text-emerald-400">98%</div>
          <div class="text-sm font-medium text-emerald-100 uppercase tracking-widest">Akurasi Data</div>
        </div>
        <div class="space-y-1">
          <div class="text-4xl lg:text-5xl font-display font-bold text-emerald-400">24/7</div>
          <div class="text-sm font-medium text-emerald-100 uppercase tracking-widest">Real-time Monitoring</div>
        </div>
        <div class="space-y-1">
          <div class="text-4xl lg:text-5xl font-display font-bold text-emerald-400">500+</div>
          <div class="text-sm font-medium text-emerald-100 uppercase tracking-widest">Mitra Petani</div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="py-24 px-6 bg-slate-50 relative">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16 space-y-4">
          <h2 class="text-3xl lg:text-4xl font-display font-bold text-slate-900">Mengapa <span
              class="text-emerald-600">NyawitAI?</span></h2>
          <p class="text-slate-500 max-w-2xl mx-auto text-lg">Platform pintar yang menggabungkan keahlian agronomi
            dengan kecerdasan buatan.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Benefit 1 -->
          <div
            class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div
              class="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 text-3xl mb-6">
              <Icon name="mdi:chart-line-variant" />
            </div>
            <h3 class="text-xl font-bold font-display text-slate-900 mb-3">Keputusan Berbasis Data</h3>
            <p class="text-slate-600 leading-relaxed">Hindari spekulasi. Setiap rekomendasi didukung oleh analisis big
              data historis dan prediktif.</p>
          </div>
          <!-- Benefit 2 -->
          <div
            class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 text-3xl mb-6">
              <Icon name="mdi:earth" />
            </div>
            <h3 class="text-xl font-bold font-display text-slate-900 mb-3">Ketahanan Iklim</h3>
            <p class="text-slate-600 leading-relaxed">Model kami memperhitungkan perubahan iklim jangka panjang untuk
              memastikan keberlanjutan investasi Anda.</p>
          </div>
          <!-- Benefit 3 -->
          <div
            class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div
              class="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 text-3xl mb-6">
              <Icon name="mdi:finance" />
            </div>
            <h3 class="text-xl font-bold font-display text-slate-900 mb-3">Proyeksi ROI Presisi</h3>
            <p class="text-slate-600 leading-relaxed">Dapatkan estimasi hasil panen dan keuntungan finansial yang
              realistis sebelum Anda menanam satu benih pun.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section (Cara Kerja) -->
    <section class="py-24 px-6 bg-white relative overflow-hidden">
      <!-- Decorative blobs -->
      <div
        class="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2">
      </div>
      <div
        class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2">
      </div>

      <div class="relative max-w-7xl mx-auto">
        <div class="text-center mb-16 space-y-4">
          <h2 class="text-3xl lg:text-4xl font-display font-bold text-slate-900">3 Langkah <span
              class="text-emerald-600">Investasi Cerdas</span></h2>
          <p class="text-slate-500 max-w-2xl mx-auto text-lg">Proses sederhana untuk hasil yang maksimal.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
          <!-- Step 1 -->
          <div
            class="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-100 hover:border-emerald-200 transition-colors group text-center space-y-6">
            <div
              class="w-20 h-20 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center text-4xl text-emerald-600 border border-slate-100 group-hover:scale-110 transition-transform duration-300">
              <Icon name="mdi:file-document-edit-outline" />
            </div>
            <div class="space-y-2">
              <h3 class="text-xl font-bold font-display text-slate-900">1. Input Parameter</h3>
              <p class="text-slate-600 leading-relaxed">Cukup masukkan luas area dan lokasi target. Sistem kami akan
                langsung mengidentifikasi koordinat geosparsial.</p>
            </div>
          </div>

          <!-- Step 2 -->
          <div
            class="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-100 hover:border-emerald-200 transition-colors group text-center space-y-6">
            <div
              class="w-20 h-20 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center text-4xl text-teal-600 border border-slate-100 group-hover:scale-110 transition-transform duration-300">
              <Icon name="mdi:brain" />
            </div>
            <div class="space-y-2">
              <h3 class="text-xl font-bold font-display text-slate-900">2. Analisis Deep Learning</h3>
              <p class="text-slate-600 leading-relaxed">Engine AI memproses ribuan data points termasuk jenis tanah,
                curah hujan, dan elevasi secara instan.</p>
            </div>
          </div>

          <!-- Step 3 -->
          <div
            class="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-100 hover:border-emerald-200 transition-colors group text-center space-y-6">
            <div
              class="w-20 h-20 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center text-4xl text-emerald-600 border border-slate-100 group-hover:scale-110 transition-transform duration-300">
              <Icon name="mdi:cube-scan" />
            </div>
            <div class="space-y-2">
              <h3 class="text-xl font-bold font-display text-slate-900">3. Visualisasi & Laporan</h3>
              <p class="text-slate-600 leading-relaxed">Terima peta kelayakan 3D interaktif dan laporan proyeksi
                finansial komprehensif untuk panduan Anda.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Waitlist / CTA Section -->
    <section class="py-24 px-6 bg-slate-900 relative overflow-hidden">
      <!-- Glow effects -->
      <div
        class="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2">
      </div>
      <div
        class="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[100px] -translate-y-1/2">
      </div>

      <div class="relative z-10 max-w-3xl mx-auto text-center space-y-8">
        <h2 class="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight">Jadilah yang Pertama
          <br />Mencoba <span class="text-emerald-400">Revolusi Agrotech</span>
        </h2>
        <p class="text-slate-400 text-lg max-w-xl mx-auto">Kami sedang mempersiapkan peluncuran publik. Masukkan email
          Anda untuk mendapatkan notifikasi dan akses awal eksklusif.</p>

        <form @submit.prevent="joinWaitlist" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input v-model="email" type="email" placeholder="alamat@email.com"
            class="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
            required />
          <button type="submit" :disabled="waitlistLoading"
            class="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer">
            <span v-if="!waitlistLoading">Gabung Waitlist</span>
            <span v-else>Memproses...</span>
          </button>
        </form>
        <!-- <p class="text-slate-500 text-xs">Kami menghargai privasi Anda. Bebas spam selamanya.</p> -->
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-950 pt-20 pb-10 px-6 text-slate-400 relative overflow-hidden">
      <!-- Palm Tree SVG Decoration -->
      <div
        class="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none w-full max-w-4xl flex justify-center items-end overflow-hidden">
        <svg viewBox="0 0 500 200" class="w-full h-auto text-emerald-500 fill-current">
          <path
            d="M250,200 L250,150 Q230,120 200,100 Q150,80 100,120 Q120,60 180,50 Q240,40 250,100 Q260,40 320,50 Q380,60 400,120 Q350,80 300,100 Q270,120 250,150 Z" />
          <!-- Stylized palm leaves abstract -->
        </svg>
      </div>

      <div class="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
        <div class="flex items-center gap-2 mb-6">
          <Icon name="mdi:leaf" class="text-emerald-700 text-2xl" />
          <span class="text-xl font-display font-bold tracking-tight text-slate-200">NyawitAI</span>
        </div>

        <div class="flex gap-8 mb-8 text-sm font-medium">
          <a href="#" class="hover:text-emerald-400 transition-colors">Tentang Kami</a>
          <a href="#" class="hover:text-emerald-400 transition-colors">Layanan</a>
          <a href="#" class="hover:text-emerald-400 transition-colors">Kebijakan Privasi</a>
          <a href="#" class="hover:text-emerald-400 transition-colors">Hubungi Kami</a>
        </div>

        <p class="text-sm">&copy; 2026 NyawitAI. Empowering Sustainable Agriculture.</p>
      </div>
    </footer>
  </div>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
        leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95">
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                Pendaftaran Waitlist Berhasil
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Anda telah berhasil mendaftar ke waitlist. Kami akan mengirimkan email konfirmasi kepada Anda.
                </p>
              </div>

              <div class="mt-4">
                <button type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="closeModal">
                  Tutup
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }

  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 0.6;
  }
}

.animate-float {
  animation: float linear infinite;
}
</style>
