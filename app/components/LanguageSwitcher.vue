<template>
  <v-menu
    location="bottom end"
    content-class="brand-select-menu"
    :close-on-content-click="true"
  >
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        variant="flat"
        size="small"
        class="language-switcher brand-filter-chip text-none"
        :aria-label="t('language.label')"
      >
        {{ currentLabel }}
        <v-icon icon="mdi-chevron-down" size="small" end />
      </v-btn>
    </template>
    <v-list class="brand-select-menu" density="compact" nav>
      <v-list-item
        v-for="opt in localeOptions"
        :key="opt.value"
        :active="locale === opt.value"
        @click="onLocaleChange(opt.value)"
      >
        <v-list-item-title>{{ opt.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import type { AppLocale } from '../../shared/i18n'
import { LOCALE_META } from '../../shared/i18n'

const { locale, localeOptions, setLocale, t } = useAppI18n()

const currentLabel = computed(() => LOCALE_META[locale.value].label)

function onLocaleChange(value: AppLocale) {
  setLocale(value)
}
</script>

<style scoped>
.language-switcher {
  min-inline-size: 5.5rem;
  padding-inline: 0.75rem !important;
}
</style>
