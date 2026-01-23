<template>
  <div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
const head = useHead({
  title: 'NyawitAI',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'NyawitAI - AI-Powered Investment for Sustainable Agriculture' },
    { name: 'format-detection', content: 'telephone=no' },
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  ],
})
</script>

<style>

</style>