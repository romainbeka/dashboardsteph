<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'
import type { Reduction } from '~/types'
import { useRoute } from 'vue-router'
import { ReductionAddModal } from '#components'
import { format } from 'date-fns'

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

const columnVisibility = ref()
const rowSelection = ref({ 1: true })

const { data, status } = await useFetch<Reduction[]>('/api/reduction', {
  lazy: true
})

onMounted(() => {
  if (status.value !== 'success') return
  if (!data.value) return

  const now = new Date()

  data.value.forEach((reduction) => {
    const endDate = new Date(reduction.end)
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays > 0 && diffDays <= 7) {
      toast.add({
        title: `Réduction "${reduction.code}" proche de l'expiration`,
        description: `Cette réduction expire dans ${diffDays} jour${diffDays > 1 ? 's' : ''}.`,
        icon: 'i-lucide-alert-triangle',
        color: 'warning'
      })
    }
  })
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
          title: 'L\'id a bien été copié',
          description: 'L\'id de la réduction a bien été copié'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: row.original.isActive ? 'Désactiver' : 'Activer', // Change dynamiquement le texte
      icon: row.original.isActive ? 'i-lucide-toggle-left' : 'i-lucide-toggle-right',
    },
    {
      label: 'Voir les détails',
      icon: 'i-lucide-list'
    },
    {
      label: 'Prolongation',
      icon: 'i-lucide-clock-arrow-up'
    },
    {
      label: 'Voir l’historique d’utilisation',
      icon: 'i-lucide-bar-chart'
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
          title: 'Réduction supprimée',
          description: `La réduction "${row.original.code}" a bien été supprimée.`
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
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', undefined, [
          h('p', { class: 'font-medium text-(--ui-text-highlighted)' }, row.original.code),
          // h('p', { class: '' }, `@${row.original.name}`)
        ])
      ])
    }
  },
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
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Utilisations',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    sortingFn: 'auto',
    cell: ({ row }) => {
      const used = row.original.utiliser
      const maxUsage = row.original.maxUsage ?? Infinity

      // Si maxUsage est null, on affiche "Utilisation illimitée"
      if (maxUsage === Infinity) {
        return h('p', { class: 'italic text-gray-400' }, `${used} / Utilisation illimitée`)
      }

      const percentage = Math.round((used / maxUsage) * 100)

      // Définition de la couleur en fonction du pourcentage d'utilisation
      let color = 'bg-green-500'
      if (percentage >= 50) color = 'bg-yellow-500'
      if (percentage >= 80) color = 'bg-red-500'

      return h('div', { class: 'w-48' }, [
        h('div', { class: 'flex justify-between text-sm mb-1' }, [
          h('span', `${used} / ${maxUsage} Utilisations`),
          h('span', { class: 'font-semibold' }, `${percentage}%`)
        ]),
        h('div', { class: 'w-full h-2 rounded bg-gray-700' }, [
          h('div', {
            class: `h-2 rounded ${color}`,
            style: { width: `${percentage}%` }
          })
        ])
      ])
    }
  },
  {
    accessorKey: 'dates',
    header: 'Dates',
    cell: ({ row }) => {
      const startDate = format(new Date(row.original.start), "dd/MM/yyyy");
      const endDate = format(new Date(row.original.end), "dd/MM/yyyy");
      return `${startDate} au ${endDate}`;
    }
  },
  {
  accessorKey: 'status',
  header: 'Statut',
  cell: ({ row }) => {
    const now = new Date();
    const startDate = new Date(row.original.start);
    const endDate = new Date(row.original.end);

    let statusText = 'Prochainement'; // Par défaut
    let statusColor = 'text-yellow-500';

    const diffDays = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (now >= startDate && now <= endDate) {
      if (diffDays <= 7) {
        statusText = `Expire dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        statusColor = 'text-blue-500';
      } else {
        statusText = 'Active';
        statusColor = 'text-green-500';
      }
    } else if (now > endDate) {
      statusText = 'Expirée';
      statusColor = 'text-red-500';
    }

    return h('span', { class: statusColor }, statusText);
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
          :model-value="(table?.tableApi?.getColumn('code')?.getFilterValue() as string)"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Nom"
          @update:model-value="table?.tableApi?.getColumn('code')?.setFilterValue($event)"
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
            v-model="statusFilter"
            :items="[
              { label: 'Tous', value: 'all' },
              { label: 'Actives', value: 'Active' },
              { label: 'Prochainement', value: 'Prochainement' },
              { label: 'Bientôt expirées', value: 'Bientôt Expirées' },
              { label: 'Expirées', value: 'Terminer' }
            ]"
            placeholder="Filtrer par statut"
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