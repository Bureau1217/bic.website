<template>
  <div>
    <Menu v-if="!isMaintenancePage" />
    <NuxtPage/>
    <AppFooter v-if="!isMaintenancePage" />
    <AudioPlayer v-if="!isMaintenancePage" />
  </div>
</template>

<script setup lang="ts">
// Détecter si on est sur la page maintenance
const route = useRoute()
const isMaintenancePage = computed(() => route.path === '/maintenance')

// Initialiser le fetch des données globales (lieux et épisodes)
// Ces données seront disponibles dans tous les composants via usePodcastData()
const { fetchPodcastData } = usePodcastData()

// Précharger les données globales sur toutes les pages (sauf maintenance)
// pour alimenter menu, cartes audio et slider portraits.
if (route.path !== '/maintenance') {
  await fetchPodcastData()
}

// Initialiser les écouteurs audio côté client
const { initAudioListeners } = useAudioPlayer()
onMounted(() => {
  initAudioListeners()
})
</script>
