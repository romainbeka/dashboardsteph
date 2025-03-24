<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { JDR } from '~/types'

const { data: reductions } = await useFetch('/api/reduction')
const { data: jdrList } = await useFetch<JDR[]>('/api/jdr')

const schema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  description: z.string().min(5, 'Description trop courte'),
  price: z.number().min(5, 'Prix invalide'),
  discount: z.string().optional(),
  compatibleSystems: z.array(z.string()),
  compatibleSystemsecondaire: z.array(z.string()),
  image: z.any().optional(),
  associatedProducts: z.array(z.string()).optional(),
  pages: z.number().min(1, 'Nombre de pages invalide'),
  theme: z.enum(['Contemporain', 'Horreur', 'Fantastique', 'Sci-fi']),
  language: z.string().default('Français')
})

type Schema = z.output<typeof schema>

const open = ref(false)

const state = reactive<Partial<Schema>>({
  name: '',
  description: '',
  price: undefined,
  discount: '',
  compatibleSystems: [],
  compatibleSystemsecondaire: [],
  image: undefined,
  associatedProducts: [],
  pages: undefined,
  theme: 'Contemporain',
  language: 'Français'
})

// Image
const imageInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const imagePreview = computed(() =>
  state.image ? URL.createObjectURL(state.image as File) : null
)

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    state.image = file
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    state.image = file
  }
}

function clearImage() {
  state.image = undefined
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

// Réduction
const reductionsOptions = computed(() =>
  (reductions.value || [])
    .filter((r) => r.status !== 'Terminer')
    .map((r) => ({
      label: `${r.code} (${r.pourcentage}% - ${r.status})`,
      value: r.code,
    }))
)

const systems = [
  'D&D', 'Chroniques Oubliées', 'Pathfinder', 'Cthulhu', 'Starfinder'
]

const compatibleSecondarySystemsMap: Record<string, string[]> = {
  'Chroniques Oubliées': ['Contemporain', 'Horreur', 'Fantastique'],
  'D&D': ['Forgotten Realms', 'Eberron', 'Spelljammer'],
  'Pathfinder': ['Golarion'],
  'Cthulhu': ['1920s', 'Contemporain', 'sci-fi'],
  'Starfinder': ['Science-Fiction', 'Espace']
}

const dynamicSecondarySystems = computed(() => {
  if (!state.compatibleSystems?.length) return []

  // On prend les premiers systèmes principaux sélectionnés
  const result: string[] = []
  state.compatibleSystems.forEach(system => {
    const compatibles = compatibleSecondarySystemsMap[system]
    if (compatibles) {
      compatibles.forEach(sub => {
        const label = `${system} - ${sub}`
        if (!result.includes(label)) result.push(label)
      })
    }
  })

  return result
})

const jdrFilteredBySecondarySystem = computed(() => {
  if (!state.compatibleSystemsecondaire?.length) return []

  return (jdrList.value || []).filter(jdr =>
    jdr.compatibleSystemsecondaire?.some((system: string) =>
      state.compatibleSystemsecondaire?.includes(system)
    )
  )
})

const toast = useToast()

function selectReduction(value: string) {
  state.discount = state.discount === value ? '' : value
}

function toggleSystem(system: string) {
  if (!state.compatibleSystems) {
    state.compatibleSystems = []
  }

  if (state.compatibleSystems.includes(system)) {
    state.compatibleSystems = state.compatibleSystems.filter(s => s !== system)
  } else {
    state.compatibleSystems.push(system)
  }
}

function toggleSystemsecondaire(system: string) {
  if (!state.compatibleSystemsecondaire) {
    state.compatibleSystemsecondaire = []
  }

  if (state.compatibleSystemsecondaire.includes(system)) {
    state.compatibleSystemsecondaire = state.compatibleSystemsecondaire.filter(s => s !== system)
  } else {
    state.compatibleSystemsecondaire.push(system)
  }
}

const items = [
  {
    slot: 'JDR',
    title: 'Jeu de rôle',
    icon: 'i-lucide-image'
  },
  {
    slot: 'Paramètre',
    title: 'Shipping',
    icon: 'i-lucide-truck'
  },
  {
    slot: 'checkout',
    title: 'Checkout',
  }
]

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const formData = new FormData()

  for (const [key, value] of Object.entries(event.data)) {
    if (key === 'image' && value instanceof File) {
      formData.append('image', value)
    } else {
      formData.append(key, JSON.stringify(value))
    }
  }

  try {
    await $fetch('/api/jdr', {
      method: 'POST',
      body: formData
    })

    toast.add({
      title: 'Succès',
      description: `Le jeu de rôle "${state.name}" a été ajouté.`,
      color: 'success'
    })

    open.value = false
  } catch (error) {
    console.error('Erreur lors de l’ajout :', error)
    toast.add({
      title: 'Erreur',
      description: 'Impossible d’ajouter ce JDR.',
      color: 'error'
    })
  }
}


</script>

<template>
  <USlideover v-model:open="open" title="Ajouter un jeu de rôle" description="Ajouter un nouveau jeu de rôle à la base de données">
    <UButton label="Nouveau jeu de rôle" icon="i-lucide-plus" />

    <template #body>
      <UStepper :items="items" class="w-full">
        <template #JDR>
          <Placeholder class="aspect-video">
            <UForm :schema="schema" :state="state" class="space-y-4">
              <!-- Image Upload & Preview -->
              <div class="space-y-2">
                <label class="text-sm font-medium">Image</label>
                <div
                  class="w-full max-w-xs border-2 border-dashed rounded-lg mt-2 p-4 flex items-center justify-center text-sm cursor-pointer transition"
                  :class="[
                    isDragging ? 'bg-gray-700 border-primary text-white' : 'border-gray-600 dark:border-gray-500 text-gray-400 dark:text-gray-300',
                    imagePreview ? 'hover:bg-black/20' : 'hover:bg-gray-800'
                  ]"
                  @click="imageInput?.click()"
                  @dragover.prevent="isDragging = true"
                  @dragleave="isDragging = false"
                  @drop.prevent="handleDrop"
                >
                  <template v-if="!imagePreview">
                    Cliquez ou déposez une image ici
                  </template>
                  <template v-else>
                    <div class="relative mx-auto border border-dashed border-gray-600 rounded-md overflow-hidden" style="width: 600px; height: 350px;">
                      <img
                        :src="imagePreview"
                        alt="Preview"
                        class="absolute inset-0 w-full h-full object-cover"
                      />
                      <button
                        class="absolute top-1 right-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded hover:bg-black/80 transition cursor-pointer z-10"
                        @click.stop="clearImage"
                      >
                        ✕
                      </button>
                    </div>
                  </template>
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleImageUpload"
                  />
                </div>
              </div>

              <USeparator />

              <!-- Nom -->
              <UFormField label="Nom" name="name">
                <UInput v-model="state.name" placeholder="Donjons & Dragons" />
              </UFormField>

              <USeparator class="my-4"/>

              <!-- Description -->
              <UFormField label="Description" name="description">
                <UTextarea v-model="state.description" placeholder="Une aventure épique dans un monde fantastique..." autoresize/>
              </UFormField>

              <USeparator class="my-4"/>

              <!-- Prix -->
              <UFormField label="Prix (€)" name="price">
                <UInput v-model="state.price" type="number" placeholder="19.99" />
              </UFormField>

              <!-- Réduction -->
              <UFormField label="Réduction" name="discount">
                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="reduction in reductionsOptions"
                    :key="reduction.value"
                    :color="state.discount === reduction.value ? 'primary' : 'neutral'"
                    variant="outline"
                    class="cursor-pointer transition"
                    @click="selectReduction(reduction.value)"
                  >
                    {{ reduction.label }}
                  </UBadge>
                </div>
              </UFormField>
            </UForm>
          </Placeholder>
        </template>

        <template #Paramètre>
          <Placeholder class="aspect-video">
            <UForm :schema="schema" :state="state" class="space-y-4">
              <!-- Systèmes compatibles -->
              <UFormField label="Systèmes compatibles" name="compatibleSystems">
                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="system in systems"
                    :key="system"
                    :color="state.compatibleSystems?.includes(system) ? 'primary' : 'neutral'"
                    variant="outline"
                    class="cursor-pointer transition"
                    @click="toggleSystem(system)"
                  >
                    {{ system }}
                  </UBadge>
                </div>
              </UFormField>

              <USeparator />

              <UFormField label="Systèmes compatibles secondaires" name="compatibleSystemsecondaire">
                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="system in dynamicSecondarySystems"
                    :key="system"
                    :color="state.compatibleSystemsecondaire?.includes(system) ? 'primary' : 'neutral'"
                    variant="outline"
                    class="cursor-pointer transition"
                    @click="toggleSystemsecondaire(system)"
                  >
                    {{ system }}
                  </UBadge>
                </div>
              </UFormField>

              <!-- Produits associés -->
              <USeparator />

              <!-- Résultats dynamiques -->
              <UFormField label="Produits liés aux systèmes secondaires">
                <div v-if="jdrFilteredBySecondarySystem.length" class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="jdr in jdrFilteredBySecondarySystem"
                    :key="jdr.id"
                    variant="solid"
                    color="primary"
                  >
                    {{ jdr.name }}
                  </UBadge>
                </div>
                <p v-else class="text-xs text-gray-400">Aucun jeu de rôle trouvé pour les systèmes secondaires sélectionnés.</p>
              </UFormField>

              <USeparator />

              <!-- Nombre de pages -->
              <UFormField label="Nombre de pages" name="pages">
                <UInput v-model="state.pages" type="number" placeholder="300" />
              </UFormField>

              <USeparator />

              <!-- Langue -->
              <UFormField label="Langue" name="language">
                <USelectMenu
                  v-model="state.language"
                  :options="['Français', 'Anglais']"
                />
              </UFormField>
            </UForm>
          </Placeholder>
        </template>

        <template #checkout>
          <Placeholder class="aspect-video">
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
              <h3 class="text-lg font-bold mb-2">Récapitulatif</h3>
            
              <ul class="text-sm space-y-1">
                <li><strong>Nom :</strong> {{ state.name }}</li>
                <li><strong>Description :</strong> {{ state.description }}</li>
                <li><strong>Prix :</strong> {{ state.price }} €</li>
                <li><strong>Réduction :</strong> {{ state.discount || 'Aucune' }}</li>
                <li><strong>Systèmes :</strong> {{ state.compatibleSystems?.join(', ') }}</li>
                <li><strong>Systèmes secondaires :</strong> {{ state.compatibleSystemsecondaire?.join(', ') }}</li>
                <li><strong>Pages :</strong> {{ state.pages }}</li>
                <li><strong>Thème :</strong> {{ state.theme }}</li>
                <li><strong>Langue :</strong> {{ state.language }}</li>
                <li>
                  <strong>Image :</strong>
                  <img v-if="imagePreview" :src="imagePreview" class="mt-2 rounded shadow w-[150px] h-auto" />
                  <span v-else class="italic">Aucune image</span>
                </li>
              </ul>
            
              <div class="flex justify-end gap-2 pt-4">
                <UButton label="Annuler" color="neutral" variant="subtle" @click="open = false" />
                <UButton label="Ajouter" color="primary" type="submit" />
              </div>
            </UForm>
          </Placeholder>
        </template>
      </UStepper>
    </template>
  </USlideover>
</template>