<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'
import type { Reduction, User } from '~/types'
import { useRoute } from 'vue-router'
import { ReductionAddModal } from '#components'

const route = useRoute()

useHead({
  title: `${route.meta.title || 'Réductions'}`
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

const { data, status } = await useFetch<Reduction[]>('/api/reduction', {
  lazy: true
})

function getRowItems(row: Row<Reduction>) {
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

const columns: TableColumn<Reduction>[] = [
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
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', undefined, [
          h('p', { class: 'font-medium text-(--ui-text-highlighted)' }, row.original.name),
          // h('p', { class: '' }, `@${row.original.name}`)
        ])
      ])
    }
  },
  // {
  //   accessorKey: 'email',
  //   header: ({ column }) => {
  //     const isSorted = column.getIsSorted()

  //     return h(UButton, {
  //       color: 'neutral',
  //       variant: 'ghost',
  //       label: 'Email',
  //       icon: isSorted
  //         ? isSorted === 'asc'
  //           ? 'i-lucide-arrow-up-narrow-wide'
  //           : 'i-lucide-arrow-down-wide-narrow'
  //         : 'i-lucide-arrow-up-down',
  //       class: '-mx-2.5',
  //       onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
  //     })
  //   }
  // },
  // {
  //   accessorKey: 'location',
  //   header: 'Location',
  //   cell: ({ row }) => row.original.location
  // },
  {
    accessorKey: 'pourcentage',
    header: 'Réductions',
    filterFn: 'equals',
    cell: ({ row }) => {
      const color = {
        10: 'primary' as const,
        60: 'warning' as const,
        100: 'error' as const
      }[row.original.pourcentage] || 'neutral'

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        `- ${row.original.pourcentage}%`
      )
    }
  },
  {
    accessorKey: 'utiliser',
    header: 'Utilisations',
    filterFn: 'equals',
    cell: ({ row }) => {
      const colorClass = {
        5: 'text-primary',
        10: 'text-warning',
        50: 'text-error'
      }[row.original.utiliser] || 'text-neutral'

      return h('p', { class: `capitalize ${colorClass}` }, 
        `${row.original.utiliser} utilisation${row.original.utiliser > 1 ? 's' : ''}`
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
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
  }
]

const pourcentageFilter = ref('all')

watch(() => pourcentageFilter.value, (newVal) => {
  if (!table?.value?.tableApi) return

  const pourcentageColumn = table.value.tableApi.getColumn('pourcentage')
  if (!pourcentageColumn) return

  if (newVal === 'all') {
    pourcentageColumn.setFilterValue(undefined)
  } else {
    pourcentageColumn.setFilterValue(newVal)
  }
})

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

</script>

<template>
  <UDashboardPanel id="réductions">
    <template #header>
      <UDashboardNavbar title="Réductions">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <ReductionAddModal />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          :model-value="(table?.tableApi?.getColumn('name')?.getFilterValue() as string)"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Nom"
          @update:model-value="table?.tableApi?.getColumn('name')?.setFilterValue($event)"
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <ReductionDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
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
          </ReductionDeleteModal>

          <USelect
            v-model="pourcentageFilter"
            :items="[
              { label: 'Tout', value: 'all' },
              { label: '10%', value: 10 },
              { label: '60%', value: 60 },
              { label: '100%', value: 100 }
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