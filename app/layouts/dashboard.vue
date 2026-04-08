<script setup lang="ts">
const auth = useAuth()

onMounted(async () => {
  if (!auth.isAuthenticated.value) {
    await auth.init()
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 flex font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
    
    <aside class="w-[300px] bg-white border-r border-slate-200 fixed h-full z-20 flex flex-col transition-all">
      
      <!-- Profil Section -->
      <div class="pt-8 px-6 pb-4 flex flex-col gap-6 border-b border-slate-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=MahiTree" alt="User Profile" class="w-14 h-14 rounded-full border border-slate-200 bg-slate-100 object-cover" />
            
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <h2 class="text-[19px] font-extrabold text-slate-800">{{ auth.user.value?.fullName || 'User' }}</h2>
                
                <div class="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 border border-emerald-200 rounded-md text-emerald-700 text-xs font-bold" title="Sisa Token">
                  <Icon name="mdi:hexagon-multiple" class="text-sm" />
                  {{ auth.balance.value }}
                </div>
              </div>
              <p class="text-slate-500 font-medium text-sm">{{ auth.user.value?.companyName || auth.user.value?.email }}</p>
            </div>
          </div>
          
          <button class="text-slate-400 hover:text-emerald-600 transition-colors mb-5">
            <Icon name="mdi:dots-horizontal" class="text-xl" />
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-6 space-y-2 overflow-y-auto">
        <NuxtLink 
          to="/dashboard" 
          class="flex items-center gap-4 px-6 py-3.5 mx-4 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:translate-x-1 transition-all duration-300 font-bold text-[16px] group"
          exact-active-class="!bg-emerald-600 !text-white hover:!text-white shadow-md shadow-emerald-600/20 !translate-x-0"
        >
          <Icon name="mdi:map-search-outline" class="text-[24px] group-hover:scale-110 transition-transform" /> 
          Analisis Lahan
        </NuxtLink>

        <NuxtLink 
          to="/dashboard/history" 
          class="flex items-center gap-4 px-6 py-3.5 mx-4 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:translate-x-1 transition-all duration-300 font-bold text-[16px] group"
          exact-active-class="!bg-emerald-600 !text-white hover:!text-white shadow-md shadow-emerald-600/20 !translate-x-0"
        >
          <Icon name="mdi:history" class="text-[24px] group-hover:scale-110 transition-transform" /> 
          Riwayat Analisis
        </NuxtLink>

        <NuxtLink 
          to="/dashboard/billing" 
          class="flex items-center gap-4 px-6 py-3.5 mx-4 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:translate-x-1 transition-all duration-300 font-bold text-[16px] group"
          exact-active-class="!bg-emerald-600 !text-white hover:!text-white shadow-md shadow-emerald-600/20 !translate-x-0"
        >
          <Icon name="mdi:wallet-outline" class="text-[24px] group-hover:scale-110 transition-transform" /> 
          Token & Billing
        </NuxtLink>

        <NuxtLink 
          to="/dashboard/pengaturan" 
          class="flex items-center gap-4 px-6 py-3.5 mx-4 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:translate-x-1 transition-all duration-300 font-bold text-[16px] group"
          exact-active-class="!bg-emerald-600 !text-white hover:!text-white shadow-md shadow-emerald-600/20 !translate-x-0"
        >
          <Icon name="mdi:cog-outline" class="text-[24px] group-hover:scale-110 transition-transform" /> 
          Pengaturan Akun
        </NuxtLink>
      </nav>

      <!-- Logout Action -->
      <div class="p-4 mt-auto mb-4 border-t border-slate-100">
        <button @click="auth.logout()" class="flex items-center gap-4 text-red-500 hover:bg-red-50 hover:text-red-600 w-full px-6 py-3.5 rounded-xl transition-all font-bold text-[16px] group cursor-pointer">
          <Icon name="mdi:logout" class="text-[24px] transform rotate-180 group-hover:-translate-x-1 transition-transform" />
          Keluar Aplikasi
        </button>
      </div>
    </aside>

    <main class="ml-[300px] flex-1 flex flex-col relative h-screen">
      
      <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
        
        <div class="hidden md:flex items-center gap-3 w-96">
          <div class="relative w-full group">
            <Icon name="mdi:magnify" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-emerald-500 transition-colors" />
            <input type="text" placeholder="Cari riwayat analisis provinsi/lahan..." class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 font-medium" />
          </div>
        </div>

        <div class="flex items-center gap-4 ml-auto">
          <button class="relative w-10 h-10 rounded-full bg-white hover:bg-emerald-50 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors border border-slate-200 cursor-pointer">
            <Icon name="mdi:bell-outline" class="text-xl" />
            <span class="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-8">
        <slot />
      </div>

    </main>
  </div>
</template>