<script setup lang="ts">
const props = withDefaults(defineProps<{
  count?: number
  jdrIds: number[]
}>(), {
  count: 0,
  jdrIds: () => []
})

const emit = defineEmits(['confirm'])
const open = ref(false)

async function onSubmit() {
  if (!props.jdrIds.length) {
    alert("Aucun ID sélectionné.")
    return
  }

  try {
    for (const id of props.jdrIds) {
      await fetch(`/api/jdr?id=${id}`, {
        method: 'DELETE'
      })
    }

    emit('confirm', props.jdrIds) // ✅ on émet les IDs supprimés
    open.value = false
  } catch (error) {
    console.error('Erreur lors de la suppression :', error)
    alert("Une erreur est survenue lors de la suppression.")
  }
}

</script>

<template>
  <UModal
    v-model:open="open"
    :title="`Supprimer ${count} jeu${count > 1 ? 'x' : ''}`"
    :description="`Êtes-vous sûr ? Cette action est irréversible.`"
  >
    <slot />

    <template #body>
      <div class="flex justify-end gap-2">
        <UButton
          label="Retour"
          color="neutral"
          variant="subtle"
          @click="open = false"
        />
        <UButton
          label="Supprimer"
          color="error"
          variant="solid"
          loading-auto
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>