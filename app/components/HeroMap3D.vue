<script setup lang="ts">
import HeroMapContent from './HeroMapContent.vue'
</script>

<template>
  <div class="w-full h-full min-h-[500px] relative">
      <TresCanvas clear-color="#f8fafc" preset="realistic" alpha>
        <TresPerspectiveCamera :position="[0, 10, 50]" :look-at="[0, 0, 0]" :far="2000" />
        
        <Suspense>
            <HeroMapContent />
        </Suspense>

      </TresCanvas>
  </div>
</template>
