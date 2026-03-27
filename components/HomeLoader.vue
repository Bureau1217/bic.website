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
        <!-- NOTRE -->
        <svg class="home-loader_logo home-loader_logo--notre" xmlns="http://www.w3.org/2000/svg" viewBox="480 120 1880 390" aria-label="Notre">
          <polygon class="logo-letter letter-1" points="717.21 487.77 569 231.82 568.03 231.82 568.03 487.77 504.65 487.77 504.65 137.72 588.01 137.72 719.64 371.74 720.62 371.74 720.62 137.72 783.51 137.72 783.51 487.77 717.21 487.77"/>
          <path class="logo-letter letter-2" d="M1121.6,312.75c0-79.95-29.25-127.25-82.39-127.25s-81.9,47.29-81.9,127.25,28.27,126.27,81.9,126.27,82.39-46.8,82.39-126.27M890.03,312.75c0-93.12,42.91-180.87,149.18-180.87s149.18,87.75,149.18,180.87c0,109.2-52.65,180.87-149.18,180.87s-149.18-71.67-149.18-180.87"/>
          <polygon class="logo-letter letter-3" points="1400.46 487.77 1400.46 194.27 1305.88 194.27 1305.88 137.72 1562.81 137.72 1562.81 194.27 1467.74 194.27 1467.74 487.77 1400.46 487.77"/>
          <path class="logo-letter letter-4" d="M1761.22,194.28h56.06c29.25,0,64.35,5.36,64.35,48.75,0,0,.11,15.61-24.62,31.4l-95.8,61.83v-141.98ZM1965.01,487.77l-81.51-169.45c34.69-23.04,65.91-40.94,65.91-79.68,0-66.79-43.39-100.92-136.02-100.92h-119.44v350.04h67.28v-95.26l66.75-41.53,62.44,136.79h74.59Z"/>
          <polygon class="logo-letter letter-5" points="2108.82 487.77 2108.82 137.72 2335.03 137.72 2335.03 194.27 2176.11 194.27 2176.11 280.08 2289.69 280.08 2289.69 334.68 2176.11 334.68 2176.11 431.21 2340.4 431.21 2340.4 487.77 2108.82 487.77"/>
        </svg>

        <p class="home-loader_text" :class="{ 'is-visible': showMessage }">{{ message }}</p>

        <!-- HISTORIA -->
        <svg class="home-loader_logo home-loader_logo--historia" xmlns="http://www.w3.org/2000/svg" viewBox="480 860 1900 830" aria-label="Historia">
          <polygon class="logo-letter letter-6" points="715.11 1272.99 715.11 1122.35 572.76 1122.35 572.76 1272.99 504.99 1272.99 504.99 922.95 572.76 922.95 572.76 1062.38 715.11 1062.38 715.11 922.95 782.39 922.95 782.39 1272.99 715.11 1272.99"/>
          <rect class="logo-letter letter-7" x="1005.19" y="922.59" width="67.28" height="350.04"/>
          <path class="logo-letter letter-8" d="M1504.37,1030.22c-12.68-32.18-38.97-59.49-71.63-59.49-30.23,0-52.65,15.11-52.65,41.93,0,71.18,183.31,31.2,183.31,159.91,0,69.72-52.65,106.28-127.73,106.28-67.77,0-109.69-26.81-131.14-93.12l54.64-35.04c9.75,37.54,38.97,73.56,80.41,73.56,35.1,0,60.45-16.09,60.45-46.8,0-77.03-184.77-34.13-184.77-164.29,0-58.5,48.75-96.04,116.52-96.04,63.38,0,103.36,25.35,122.86,80.44l-50.24,32.67Z"/>
          <polygon class="logo-letter letter-9" points="1795.21 1272.64 1795.21 979.14 1700.63 979.14 1700.63 922.59 1957.55 922.59 1957.55 979.14 1862.49 979.14 1862.49 1272.64 1795.21 1272.64"/>
          <path class="logo-letter letter-10" d="M2224.22,1223.88c-53.63,0-81.9-46.8-81.9-126.27s28.76-127.24,81.9-127.24,82.39,47.29,82.39,127.24-28.76,126.27-82.39,126.27M2255.84,919.58l57.81-54.73h-66.3l-39.68,52.65c-94.2,8.68-132.64,91.99-132.64,180.11,0,109.21,53.14,180.87,149.18,180.87s149.18-71.66,149.18-180.87c0-83.31-33.96-162.31-117.57-178.03"/>
          <path class="logo-letter letter-11" d="M1365.7,1374.64h56.06c29.25,0,64.35,5.36,64.35,48.75,0,0,.11,15.61-24.62,31.4l-95.8,61.83v-141.98ZM1569.49,1668.13l-81.51-169.45c34.69-23.04,65.91-40.94,65.91-79.68,0-66.79-43.39-100.92-136.02-100.92h-119.44v350.04h67.28v-95.26l66.75-41.53,62.44,136.79h74.59Z"/>
          <rect class="logo-letter letter-12" x="1795.73" y="1318.08" width="67.28" height="350.04"/>
          <path class="logo-letter letter-13" d="M2172.1,1555.13l50.17-181.47h.97l50.17,181.47h-101.32ZM2161.06,1318.08v2.5s12.48,13.62,7.63,29.75l-95.61,317.8h67.77l15.74-56.93h132.32l15.74,56.93h70.69l-105.79-350.04h-108.5Z"/>
        </svg>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  visible: boolean
  message?: string
}>(), {
  message: '',
})

const showMessage = ref(false)

watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    showMessage.value = false
    setTimeout(() => {
      showMessage.value = true
    }, 600)
  }
}, { immediate: true })
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
  gap: 48px;
  text-align: center;
  padding: 20px;
}

.home-loader_logo {
  width: 50vw;
  max-width: 700px;
  height: auto;

  .logo-letter {
    fill: #fff;
    opacity: 0;
    animation: letterFadeIn 0.4s ease forwards;
  }

  // Ordre: R, H, O, S, N, A, R, E, I, T, I, T, O
  .letter-4 { animation-delay: 0s; }       // R (NOTRE) - 1
  .letter-6 { animation-delay: 0.08s; }    // H - 2
  .letter-2 { animation-delay: 0.16s; }    // O (NOTRE) - 3
  .letter-8 { animation-delay: 0.24s; }    // S - 4
  .letter-1 { animation-delay: 0.32s; }    // N - 5
  .letter-13 { animation-delay: 0.4s; }    // A - 6
  .letter-11 { animation-delay: 0.48s; }   // R (HISTORIA) - 7
  .letter-5 { animation-delay: 0.56s; }    // E - 8
  .letter-7 { animation-delay: 0.64s; }    // I (1er) - 9
  .letter-3 { animation-delay: 0.72s; }    // T (NOTRE) - 10
  .letter-12 { animation-delay: 0.8s; }    // I (2ème) - 11
  .letter-9 { animation-delay: 0.88s; }    // T (HISTORIA) - 12
  .letter-10 { animation-delay: 0.96s; }   // O (HISTORIA) - 13

}

@keyframes letterFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.home-loader_text {
  color: var(--white, #fff);
  font-family: Gt Sectra, Arial, sans-serif;
  font-size: 25px;
  line-height: 1.2;
  opacity: 0;
  transition: opacity 0.5s ease;

  &.is-visible {
    opacity: 1;
  }
}

.home-loader-fade-enter-active,
.home-loader-fade-leave-active {
  transition: opacity 0.45s ease;
}

.home-loader-fade-enter-from,
.home-loader-fade-leave-to {
  opacity: 0;
}

@media screen and (max-width: 768px) {
  .home-loader_content {
    gap: 24px;
  }

  .home-loader_logo {
    width: 80vw;
  }

  .home-loader_text {
    font-size: 25px;
  }
}

@media screen and (max-width: 480px) {
  .home-loader_content {
    gap: 16px;
  }

  .home-loader_logo {
    width: 80vw;
  }

  .home-loader_text {
    font-size: 16px;
  }
}
</style>
