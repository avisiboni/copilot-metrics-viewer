<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { shouldUseMockData } from '../../shared/utils/mock-mode';

const route = useRoute();

// TODO: there might be a better way than overriding the config with route
const config = useRuntimeConfig();

if (shouldUseMockData(config.public, route.query)) {
  config.public.isDataMocked = true;
  config.public.usingGithubAuth = false;
}

if (route.params.ent || route.params.org) {
  config.public.githubEnt = route.params.ent as string
  config.public.githubOrg = route.params.org as string
  config.public.githubTeam = route.params.team as string

  
  // update scope
  if (route.params.org && route.params.team) {
    config.public.scope = 'team-organization'
  } else if (route.params.org) {
    config.public.scope = 'organization'
  } else if (route.params.ent && route.params.team) {
    config.public.scope = 'team-enterprise'
  } else if (route.params.ent) {
    config.public.scope = 'enterprise'
  } 
}

computed(() => config.public.version);
</script>

<template>
  <MainComponent />
</template>
