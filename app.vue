<template>
  <div>
    <Menu />
    <NuxtPage/>
    <AppFooter />
    <AudioPlayer />
  </div>
</template>

<script setup lang="ts">
// Initialiser le fetch des données globales (lieux et épisodes)
// Ces données seront disponibles dans tous les composants via usePodcastData()
const { fetchPodcastData } = usePodcastData()
await fetchPodcastData()

// Initialiser les écouteurs audio côté client
const { initAudioListeners } = useAudioPlayer()
onMounted(() => {
  initAudioListeners()
})
</script>
