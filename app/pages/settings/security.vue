<script setup lang="ts">
import * as z from 'zod'
import type { FormError } from '@nuxt/ui'
import { useRoute } from 'vue-router'

const route = useRoute()

useHead({
  title: `${route.meta.title || 'Paramètre'} - Sécurité`
})

const passwordSchema = z.object({
  current: z.string().min(8, 'Must be at least 8 characters'),
  new: z.string().min(8, 'Must be at least 8 characters')
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  current: undefined,
  new: undefined
})

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: 'new', message: 'Passwords must be different' })
  }
  return errors
}
</script>

<template>
  <UPageCard
    title="Mot de passe"
    description="Veuillez entrez votre mot de passe actuel pour en définir un nouveau."
    variant="subtle"
  >
    <UForm
      :schema="passwordSchema"
      :state="password"
      :validate="validate"
      class="flex flex-col gap-4 max-w-xs"
    >
      <UFormField name="current">
        <UInput
          v-model="password.current"
          type="password"
          placeholder="Mot de passe actuel"
          class="w-full"
        />
      </UFormField>

      <UFormField name="new">
        <UInput
          v-model="password.new"
          type="password"
          placeholder="Nouveau mot de passe"
          class="w-full"
        />
      </UFormField>

      <UButton label="Sauvegarder" class="w-fit" type="submit" />
    </UForm>
  </UPageCard>

  <UPageCard
    title="Compte"
    description="
Vous ne souhaitez plus utiliser notre service ? Vous pouvez supprimer votre compte ici. Cette action est irréversible. Toutes les informations relatives à ce compte seront définitivement supprimées."
    class="bg-gradient-to-tl from-(--ui-error)/10 from-5% to-(--ui-bg)"
  >
    <template #footer>
      <UButton label="Supprimer mon compte" color="error" />
    </template>
  </UPageCard>
</template>
