<template>
  <Transition name="home-loader-fade">
    <div
      v-if="visible"
      class="home-loader"
      role="status"
      aria-live="polite"
      aria-label="Chargement de la page d'accueil"
    >
      <div class="home-loader_content">
        <img
          src="/images/Logo-Notre-Historia.svg"
          alt="Notre Historia"
          class="home-loader_logo"
          width="468"
          height="44"
        >
        <p class="home-loader_text">{{ message }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  visible: boolean
  message?: string
}>(), {
  message: "Chargement de l'experience immersive...",
})
</script>

<style scoped lang="scss">
.home-loader {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--red, #fe0002);
  pointer-events: all;
}

.home-loader_content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
  padding: 20px;
}

.home-loader_logo {
  max-width: min(80vw, 468px);
  height: auto;
}

.home-loader_text {
  color: var(--white, #fff);
  font-family: Gt Sectra, Arial, sans-serif;
  font-size: 18px;
  line-height: 1.2;
}

.home-loader-fade-enter-active,
.home-loader-fade-leave-active {
  transition: opacity 0.45s ease;
}

.home-loader-fade-enter-from,
.home-loader-fade-leave-to {
  opacity: 0;
}
</style>
