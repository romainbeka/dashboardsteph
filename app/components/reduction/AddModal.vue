<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  code: z.string().min(2, 'Trop court'),
  name: z.string().min(2, 'Nom requis'),
  date: z.object({
    start: z.date({ required_error: 'Date de début requise' }),
    end: z.date({ required_error: 'Date de fin requise' })
  }),
  discount: z
    .number({ invalid_type_error: 'Doit être un nombre' })
    .min(1, 'Minimum 1%')
    .max(100, 'Maximum 100%')
})

const open = ref(false)

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  code: undefined,
  name: undefined,
  date: {
    start: null,
    end: null
  },
  discount: undefined
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { code, name, discount, date } = event.data

  toast.add({
    title: 'Succès',
    description: `Réduction « ${name} » de ${discount}% (du ${date.start.toLocaleDateString()} au ${date.end.toLocaleDateString()}) pour ${code}`,
    color: 'success'
  })

  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" title="Ajouter" description="Ajouter une nouvelle personne a la database"> <!-- Faire pareil pour les codes promos -->
    <UButton label="Nouvelle réduction" icon="i-lucide-plus" />

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Nom de la réduction" name="name">
          <UInput v-model="state.name" class="w-full" />
        </UFormField>
      
        <UFormField label="Code" name="code">
          <UInput v-model="state.code" class="w-full" />
        </UFormField>
      
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Période de validité" name="date">
            <ReductionDateRangePicker v-model="state.date" />
          </UFormField>
        </div>
      
        <UFormField label="Pourcentage de réduction (%)" name="discount">
          <UInput v-model.number="state.discount" type="number" class="w-full" min="1" max="100" />
        </UFormField>
      
        <div class="flex justify-end gap-2">
          <UButton label="Retour" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="Ajouter" color="primary" variant="solid" type="submit" />
        </div>
      </UForm>

    </template>
  </UModal>
</template>
