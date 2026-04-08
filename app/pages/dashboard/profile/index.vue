<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const auth = useAuth()
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = ref({
  fullName: auth.user.value?.fullName || '',
  companyName: auth.user.value?.companyName || '',
  email: auth.user.value?.email || '',
  // password: '',
  // passwordConfirm: ''
})

watch(() => auth.user.value, (newUser) => {
  if (newUser) {
    form.value.fullName = newUser.fullName
    form.value.companyName = newUser.companyName || ''
    form.value.email = newUser.email
  }
}, { immediate: true })

const updateProfile = async () => {
  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    const payload: any = {
      fullName: form.value.fullName,
      companyName: form.value.companyName
    }

    const { data, error } = await useApiFetch('/api/auth/profile', {
      method: 'PUT',
      body: payload,
    })

    if (error.value) {
      throw new Error(error.value.data?.message || 'Gagal memperbarui profil')
    }
    successMessage.value = 'Profil berhasil diperbarui'
    // form.value.password = ''
    // form.value.passwordConfirm = '' 
    //refresh the page
    await auth.init();
  } catch (error: any) {
    console.error('Failed to update profile:', error)
    errorMessage.value = error.message || 'Gagal memperbarui profil'
  } finally {
    isLoading.value = false
    setTimeout(() => {
      successMessage.value = ''
      errorMessage.value = ''
    }, 3000)
  }
}
</script>

<template>
  <div class="max-w-4xl max-w-7xl mx-auto space-y-8">
    
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Pengaturan Akun</h1>
        <p class="text-slate-500 mt-2 font-medium">Kelola informasi profil dan pengaturan akun Anda.</p>
      </div>
    </div>

    <div class="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm relative overflow-hidden">
      <!-- Success Message -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-4 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-4 opacity-0"
      >
        <div v-if="successMessage" class="absolute top-0 left-0 right-0 bg-emerald-50 text-emerald-600 px-6 py-4 flex items-center justify-center font-bold gap-2 border-b border-emerald-100">
          <Icon name="mdi:check-circle" class="text-xl" />
          {{ successMessage }}
        </div>
        <div v-else-if="errorMessage" class="absolute top-0 left-0 right-0 bg-red-50 text-red-600 px-6 py-4 flex items-center justify-center font-bold gap-2 border-b border-red-100">
          <Icon name="mdi:close-circle" class="text-xl" />
          {{ errorMessage }}
        </div>
      </Transition>

      <div class="flex flex-col md:flex-row gap-12 mt-4" :class="{ 'pt-12': successMessage || errorMessage }">
        <!-- Avatar Section -->
        <div class="flex flex-col items-center gap-3">
          <div class="relative group cursor-pointer">
            <div class="w-32 h-32 rounded-full border-4 border-slate-100 bg-slate-50 overflow-hidden relative group-hover:border-emerald-100 transition-colors">
              <img :src="`https://api.dicebear.com/7.x/notionists/svg?seed=MahiTree`" alt="Profile avatar" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon name="mdi:camera" class="text-white text-3xl" />
              </div>
            </div>
          </div>
          <div class="text-center">
            <h3 class="font-bold text-slate-800 text-lg">{{ form.fullName || 'Nama Pengguna' }}</h3>
            <p class="text-slate-500 text-sm font-medium">{{ form.companyName || 'Perusahaan/Organisasi' }}</p>
          </div>
        </div>

        <!-- Form Section -->
        <form @submit.prevent="updateProfile" class="flex-1 space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700">Nama Lengkap</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="mdi:account" class="text-slate-400" />
                </div>
                <input 
                  v-model="form.fullName"
                  type="text" 
                  class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-800"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700">Alamat Email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon name="mdi:email" class="text-slate-400" />
                </div>
                <input 
                  v-model="form.email"
                  type="email" 
                  class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-800 cursor-not-allowed opacity-70"
                  placeholder="Masukkan email"
                  disabled
                  title="Email tidak dapat diubah"
                />
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700">Nama Perusahaan / Organisasi</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon name="mdi:domain" class="text-slate-400" />
              </div>
              <input 
                v-model="form.companyName"
                type="text" 
                class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-800"
                placeholder="Masukkan nama perusahaan atau organisasi"
              />
            </div>
          </div>

          <!-- Password Section (UI Only) -->
          <!-- <div class="pt-6 mt-6 border-t border-slate-100 space-y-6">
            <h3 class="font-bold text-slate-800 text-lg">Keamanan Akun</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700">Kata Sandi Baru</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon name="mdi:lock-outline" class="text-slate-400" />
                  </div>
                  <input 
                    v-model="form.password"
                    type="password" 
                    class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-800"
                    placeholder="Kosongkan jika tidak ingin diubah"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700">Konfirmasi Kata Sandi</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon name="mdi:lock-check-outline" class="text-slate-400" />
                  </div>
                  <input 
                    v-model="form.passwordConfirm"
                    type="password" 
                    class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-800"
                    placeholder="Ulangi kata sandi baru"
                  />
                </div>
              </div>
            </div>
          </div> -->

          <div class="flex justify-end pt-6 mt-6 border-t border-slate-100 gap-4">
            <button 
              type="button" 
              class="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              class="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              :disabled="isLoading"
            >
              <template v-if="isLoading">
                <Icon name="mdi:loading" class="animate-spin text-xl" />
                Menyimpan...
              </template>
              <template v-else>
                <Icon name="mdi:content-save" class="text-xl" />
                Simpan Perubahan
              </template>
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>