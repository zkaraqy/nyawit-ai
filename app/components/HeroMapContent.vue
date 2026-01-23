<script setup lang="ts">
import { useLoop } from '@tresjs/core'
import { OrbitControls, GLTFModel } from '@tresjs/cientos'
import { shallowRef } from 'vue'

const groupRef = shallowRef(null)

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  // Auto-rotate slowly (smooth)
  if (groupRef.value) {
     groupRef.value.rotation.y += delta * 0.1
  }
})
</script>

<template>
  <OrbitControls 
    :enable-zoom="false" 
    :enable-pan="false" 
    :enable-rotate="false"
    :auto-rotate="false"
    :min-distance="10"
    :max-distance="50"
  />

  <TresGroup ref="groupRef">
    <GLTFModel path="/3D/peta_provinsi_indonesia.glb" :scale="160" />
  </TresGroup>

  <TresAmbientLight :intensity="2" />
  <TresDirectionalLight :position="[10, 10, 10]" :intensity="1" />
</template>
