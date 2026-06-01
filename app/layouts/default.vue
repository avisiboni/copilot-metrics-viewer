<template>
  <v-app>
    <v-locale-provider :rtl="isRtl">
      <slot />
      <v-footer class="brand-footer text-center d-flex flex-column fixed-footer">
        <div class="px-4 py-2 text-center w-100">
          {{ new Date().getFullYear() }} —
          <strong><a :href="branding.footerProjectUrl" target="_blank" rel="noopener noreferrer">{{ branding.appName }}</a></strong>
          —
          {{ version }}
          <template v-if="docsUrl">
            —
            <a
              :href="docsUrl"
              :target="docsLinkExternal ? '_blank' : undefined"
              :rel="docsLinkExternal ? 'noopener noreferrer' : undefined"
            >{{ t('footer.docs') }}</a>
          </template>
        </div>
      </v-footer>
    </v-locale-provider>
  </v-app>
</template>

<script lang="ts" setup>
import { buildPageTitle } from '../../shared/i18n/buildPageTitle'

const { t, isRtl } = useAppI18n()
const config = useRuntimeConfig();
const branding = useAppBranding()
const version = computed(() => config.public.version);
const docsUrl = computed(() => config.public.docsUrl || '/docs');
const docsLinkExternal = computed(() => /^https?:\/\//i.test(docsUrl.value));
const pageTitle = computed(() =>
  buildPageTitle(t.value, config.public, branding.value.appName),
)
useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: () => branding.value.metaDescription },
  ],
  link: [
    { rel: 'icon', href: () => branding.value.faviconHref },
  ],
});
</script>

<style scoped>
.fixed-footer {
  height: 50px;
  max-height: 50px;
}
</style>
