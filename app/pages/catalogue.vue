<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'
import type { JDR } from '~/types'
import { useRoute } from 'vue-router'

const route = useRoute()

useHead({
  title: `${route.meta.title || 'Catalogue'}`
})

const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
  id: 'email',
  value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({ 1: true })

const data = ref<JDR[]>([])

const { data: fetchedData, status } = await useFetch<JDR[]>('/api/jdr', {
  lazy: true
})

function getRowItems(row: Row<JDR>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copier l\'Id',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString())
        toast.add({
          title: 'L\'id à bien été copier',
          description: 'L\'id de l\'utilisateur à bien été copier'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Voir les détails',
      icon: 'i-lucide-list'
    },
    {
      label: 'Voir les moyens de paiement',
      icon: 'i-lucide-wallet'
    },
    {
      type: 'separator'
    },
    {
      label: 'Supprimer',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        toast.add({
          title: 'L\'utilisateur à bien été supprimer',
          // description: 'The customer has been deleted.'
        })
      }
    }
  ]
}

const columns: TableColumn<JDR>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'ariaLabel': 'Select row'
      })
  },
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'avatar',
    header: 'Image',
    cell: ({ row }) => {
      return h('img', {
        src: row.original.avatar?.src,
        alt: 'Avatar',
        class: 'w-12 h-12 object-cover rounded-full shadow'
      })
    }
  },
  {
    accessorKey: 'compatibleSystems',
    header: 'Systèmes',
    cell: ({ row }) => {
      const systems = row.original.compatibleSystems || []
      return h('div', {}, systems.map((system, index) => 
        h('p', {}, [
          system,
          index < systems.length - 1 ? ',' : ''
        ])
      ))
    }
  },
  {
    accessorKey: 'name',
    header: 'Nom'
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.original.description || '-'
      const maxLength = 10 // nombre de caractères à afficher max
      return description.length > maxLength
        ? description.slice(0, maxLength) + '...'
        : description
    }
  },
  {
    accessorKey: 'price',
    header: 'Prix (€)',
    cell: ({ row }) => row.original.price ? `${row.original.price} €` : '-'
  },
  {
    accessorKey: 'discount',
    header: 'Réduction',
    cell: ({ row }) => row.original.discount || 'Aucune'
  },
  {
    accessorKey: 'systems',
    header: 'Systèmes secondaires',
    cell: ({ row }) => {
      const systems = row.original.compatibleSystemsecondaire || []
      return h('div', {}, systems.map((system, index) => 
        h('p', {}, [
          system,
          index < systems.length - 1 ? ',' : ''
        ])
      ))
    }
  },
  {
    accessorKey: 'associatedProducts',
    header: 'Produits associés',
    cell: ({ row }) => {
      const products = row.original.associatedProducts || []
      return h('div', { class: 'flex flex-wrap gap-1' },
        products.map(product =>
          h(resolveComponent('UBadge'), { color: 'primary', variant: 'soft' }, () => product)
        )
      )
    }
  },
  {
    accessorKey: 'pages',
    header: 'Pages'
  },
  {
    accessorKey: 'theme',
    header: 'Thèm'
  },
  {
    accessorKey: 'language',
    header: 'Langue'
  },
  {
    id: 'actions',
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row)
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
  }
]

const statusFilter = ref('all')

watch(() => statusFilter.value, (newVal) => {
  if (!table?.value?.tableApi) return

  const statusColumn = table.value.tableApi.getColumn('status')
  if (!statusColumn) return

  if (newVal === 'all') {
    statusColumn.setFilterValue(undefined)
  } else {
    statusColumn.setFilterValue(newVal)
  }
})

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

const loadData = async () => {
  const res = await fetch('/api/jdr')
  data.value = await res.json()
}

const addJdr = (newJdr: JDR) => {
  // 1. Mettre à jour les anciens JDR pour ajouter la réciprocité dans les produits associés
  const updatedData = data.value.map(jdr => {
    if (newJdr.associatedProducts?.includes(jdr.name)) {
      // On ajoute le nouveau JDR dans la liste associée s'il n'y est pas déjà
      const updatedProducts = jdr.associatedProducts || []
      if (!updatedProducts.includes(newJdr.name)) {
        updatedProducts.push(newJdr.name)
      }

      return {
        ...jdr,
        associatedProducts: updatedProducts
      }
    }
    return jdr
  })

  // 2. Ajouter le nouveau JDR à la liste avec les mises à jour
  data.value = [...updatedData, newJdr]
}

watchEffect(() => {
  if (fetchedData.value) {
    data.value = [...fetchedData.value] // on initialise `data`
  }
})

</script>

<template>
  <UDashboardPanel id="Catalogue">
    <template #header>
      <UDashboardNavbar title="Catalogue">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <CatalogueAddModal @added="addJdr"/>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          :model-value="(table?.tableApi?.getColumn('email')?.getFilterValue() as string)"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Email"
          @update:model-value="table?.tableApi?.getColumn('email')?.setFilterValue($event)"
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <CatalogueDeleteModal
            :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0"
            :jdr-ids="table?.tableApi?.getFilteredSelectedRowModel().rows.map(row => row.original.id) || []"
            @confirm="loadData"
          >
            <UButton
              v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
              label="Supprimer"
              color="error"
              variant="subtle"
              icon="i-lucide-trash"
            >
              <template #trailing>
                <UKbd>
                  {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                </UKbd>
              </template>
            </UButton>
          </CatalogueDeleteModal>

          <USelect
            v-model="statusFilter"
            :items="[
              { label: 'Tout', value: 'all' },
              { label: 'Abonné', value: 'Abonné' },
              { label: 'Désabonner', value: 'Désabonner' },
              { label: 'Suspendu', value: 'Suspendu' }
            ]"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="Filter status"
            class="min-w-28"
          />
          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault()
                  }
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="Afficher"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-settings-2"
            />
          </UDropdownMenu>
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:column-visibility="columnVisibility"
        v-model:row-selection="rowSelection"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
        class="shrink-0"
        :data="data"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-1 first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
          td: 'border-b border-(--ui-border)'
        }"
      />

      <div class="flex items-center justify-between gap-3 border-t border-(--ui-border) pt-4 mt-auto">
        <div class="text-sm text-(--ui-text-muted)">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>