<template>
  <div>
    <Transition name="loader-fade" @after-leave="loaderGone = true">
      <div v-if="showLoader" class="app-loader"></div>
    </Transition>
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

// Loader initial : fondu blanc au premier chargement
const showLoader = ref(true)
const loaderGone = ref(false)

// Initialiser les écouteurs audio côté client
const { initAudioListeners } = useAudioPlayer()
onMounted(() => {
  initAudioListeners()
  // Petit délai pour laisser le premier paint se faire, puis fondu
  requestAnimationFrame(() => {
    showLoader.value = false
  })
})
</script>

<style lang="scss">
.app-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: var(--white, #fff);
  pointer-events: none;
}

.loader-fade-leave-active {
  transition: opacity 0.7s ease;
}

.loader-fade-leave-to {
  opacity: 0;
}
</style>
