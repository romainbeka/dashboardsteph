<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

useSeoMeta({
  title: 'Cette page est introuvable',
  description: 'We are sorry but this page could not be found.'
})

useHead({
  htmlAttrs: {
    lang: 'fr'
  }
})
</script>

<template>
  <UApp>
    <UError :error="error" />
  </UApp>
</template>
