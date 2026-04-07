<script setup lang="ts">
import { ref } from 'vue'

const isLogin = ref(true)
const isLoading = ref(false)

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value
  // Reset form saat pindah mode
  form.value = { name: '', email: '', password: '', confirmPassword: '' }
}

const handleSubmit = () => {
  if (!isLogin.value && form.value.password !== form.value.confirmPassword) {
    alert('Password tidak cocok!')
    return
  }

  isLoading.value = true
  // Simulasi pemanggilan API
  setTimeout(() => {
    isLoading.value = false
    alert(isLogin.value ? `Berhasil masuk dengan email: ${form.value.email}` : 'Berhasil mendaftar! Silakan masuk.')
    if (!isLogin.value) toggleAuthMode() // Kembali ke login setelah daftar
  }, 1500)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col justify-center items-center relative overflow-hidden selection:bg-emerald-200 selection:text-emerald-900">
    
    <div class="absolute inset-0 z-0 bg-linear-to-br from-slate-50 via-emerald-50/30 to-teal-100/40 pointer-events-none"></div>
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div v-for="n in 5" :key="n" class="absolute bg-emerald-400/20 rounded-full blur-2xl animate-float" :style="{
        width: Math.random() * 150 + 100 + 'px',
        height: Math.random() * 150 + 100 + 'px',
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
        animationDelay: Math.random() * 5 + 's',
        animationDuration: Math.random() * 10 + 10 + 's'
      }"></div>
    </div>

    <div class="relative z-10 w-full max-w-md px-6 animate-fade-in-up">
      
      <NuxtLink to="/" class="flex flex-col items-center gap-2 mb-8 group cursor-pointer hover:scale-105 transition-transform">
        <div class="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:bg-emerald-500 transition-colors">
          <Icon name="mdi:leaf" class="text-white text-3xl" />
        </div>
        <span class="text-2xl font-display font-extrabold tracking-tight text-slate-900">NyawitAI</span>
      </NuxtLink>

      <div class="p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl shadow-emerald-900/10 w-full">
        
        <div class="text-center mb-8">
          <h2 class="text-2xl font-display font-bold text-slate-900 mb-2">
            {{ isLogin ? 'Selamat Datang Kembali' : 'Mulai Perjalanan Anda' }}
          </h2>
          <p class="text-sm text-slate-500">
            {{ isLogin ? 'Masuk untuk melihat analisis kebun sawit Anda.' : 'Daftar sekarang untuk revolusi investasi sawit.' }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          
          <div v-if="!isLogin" class="space-y-1.5 animate-fade-in-up" style="animation-duration: 0.4s;">
            <label class="text-sm font-semibold text-slate-700 block ml-1">Nama Lengkap</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <Icon name="mdi:account-outline" class="text-lg" />
              </div>
              <input v-model="form.name" type="text" placeholder="John Doe"
                class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400 font-sans"
                required />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-slate-700 block ml-1">Email</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <Icon name="mdi:email-outline" class="text-lg" />
              </div>
              <input v-model="form.email" type="email" placeholder="alamat@email.com"
                class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400 font-sans"
                required />
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between items-center ml-1">
              <label class="text-sm font-semibold text-slate-700">Password</label>
              <a v-if="isLogin" href="#" class="text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
                Lupa Password?
              </a>
            </div>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <Icon name="mdi:lock-outline" class="text-lg" />
              </div>
              <input v-model="form.password" type="password" placeholder="••••••••"
                class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400 font-sans"
                required />
            </div>
          </div>

          <div v-if="!isLogin" class="space-y-1.5 animate-fade-in-up" style="animation-duration: 0.5s;">
            <label class="text-sm font-semibold text-slate-700 block ml-1">Konfirmasi Password</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <Icon name="mdi:lock-check-outline" class="text-lg" />
              </div>
              <input v-model="form.confirmPassword" type="password" placeholder="••••••••"
                class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400 font-sans"
                required />
            </div>
          </div>

          <button type="submit" :disabled="isLoading"
            class="w-full mt-2 py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/30 transform transition-all active:scale-[0.98] flex justify-center items-center gap-2 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
            <span v-if="!isLoading">{{ isLogin ? 'Masuk Sekarang' : 'Daftar Akun' }}</span>
            <span v-else>Memproses...</span>
            <Icon v-if="!isLoading" :name="isLogin ? 'mdi:login' : 'mdi:account-plus-outline'" class="group-hover:translate-x-1 transition-transform" />
            <Icon v-else name="svg-spinners:180-ring" />
          </button>
        </form>


        <button type="button" class="w-full mt-6 py-3 px-6 rounded-xl bg-white border  hover:bg-slate-50 text-slate-700 font-semibold transition-all flex justify-center items-center gap-3 cursor-pointer">
          <Icon name="logos:google-icon" class="text-xl" />
          Lanjutkan dengan Google
        </button>

        <p class="mt-8 text-center text-sm text-slate-600">
          {{ isLogin ? 'Belum punya akun?' : 'Sudah punya akun?' }}
          <button @click="toggleAuthMode" type="button" class="font-bold text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer focus:outline-none">
            {{ isLogin ? 'Daftar di sini' : 'Masuk sekarang' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  animation: fade-in-up 0.6s ease-out forwards;
}

@keyframes float {
  0%, 100% {
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