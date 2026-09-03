<template>
  <div
    class="brand-table-header-hint d-inline-flex align-center ga-1 flex-wrap"
    :class="{ 'brand-table-header-hint--sortable': isSortable }"
    :role="isSortable ? 'button' : undefined"
    :tabindex="isSortable ? 0 : undefined"
    @click="onHeaderClick"
    @keydown.enter.prevent="onHeaderActivate"
    @keydown.space.prevent="onHeaderActivate"
  >
    <span>{{ label }}</span>
    <v-icon
      v-if="isSortable && sortIcon"
      :icon="sortIcon"
      size="small"
      class="brand-table-header-hint__sort-icon"
      aria-hidden="true"
    />
    <BrandTooltip
      v-if="tooltip"
      :text="tooltip"
      location="top"
      :max-width="360"
    >
      <template #activator="{ props: tipProps }">
        <v-icon
          v-bind="tipProps"
          icon="mdi-information-outline"
          size="small"
          class="brand-table-header-hint__icon"
          :aria-label="tooltip"
          @click.stop
        />
      </template>
    </BrandTooltip>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'

/** Minimal column shape from Vuetify v-data-table header slots. */
interface DataTableHeaderColumn {
  key?: string | null
  sortable?: boolean
}

type GetSortIcon = (column: DataTableHeaderColumn) => string | undefined
type ToggleSort = (column: DataTableHeaderColumn) => void

export default defineComponent({
  name: 'BrandTableHeaderHint',
  props: {
    label: { type: String, required: true },
    tooltip: { type: String, default: '' },
    column: { type: Object as PropType<DataTableHeaderColumn>, default: undefined },
    getSortIcon: { type: Function as PropType<GetSortIcon>, default: undefined },
    toggleSort: { type: Function as PropType<ToggleSort>, default: undefined },
  },
  setup(props) {
    const isSortable = computed(
      () =>
        props.column?.sortable !== false &&
        Boolean(props.getSortIcon && props.toggleSort)
    )
    const sortIcon = computed(() =>
      props.column && props.getSortIcon ? props.getSortIcon(props.column) : undefined
    )

    const activateSort = () => {
      if (!isSortable.value || !props.column || !props.toggleSort) return
      props.toggleSort(props.column)
    }

    const onHeaderClick = (event: MouseEvent) => {
      if (!isSortable.value) return
      const target = event.target as HTMLElement | null
      if (target?.closest('.brand-table-header-hint__icon')) return
      event.stopPropagation()
      activateSort()
    }

    const onHeaderActivate = () => {
      activateSort()
    }

    return { isSortable, sortIcon, onHeaderClick, onHeaderActivate }
  },
})
</script>
