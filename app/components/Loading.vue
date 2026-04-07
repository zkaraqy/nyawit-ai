<template>
    <div class="fixed inset-0 z-100 bg-white flex flex-col items-center justify-center transition-opacity duration-500">
        <div class="relative w-24 h-24 mb-4">
            <Icon name="mdi:leaf"
                class="text-emerald-600 text-6xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <div class="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin">
            </div>
        </div>
        <h2 class="text-xl font-bold font-display text-slate-800 tracking-wider">NyawitAI</h2>
        <p class="text-slate-500 text-sm mt-2 animate-pulse">{{ props.description || 'Loading...' }}</p>
    </div>
</template>

<script setup lang="ts"> 
const props = defineProps({
    description : {
        type: String,
        required: false,
    }
})
    
</script>