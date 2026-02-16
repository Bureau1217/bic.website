<template>
  <div :class="rootClass" v-bind="$attrs">
    <div class="audio-card_image_wrapper">
      <slot name="image">
        <img 
          v-if="image" 
          :src="image" 
          :srcset="srcset" 
          :sizes="sizes" 
          :alt="alt" 
          loading="lazy" 
          class="audio-card_image"
        />
      </slot>
      <div v-if="showButton" class="audio-card_button" @click.prevent.stop="$emit('play')">
        <img class="image" src="/images/Picto-Podcast-jaune.svg" loading="lazy" alt="">
        <span v-if="duration" class="audio-card_time">{{ duration }}</span>
      </div>
    </div>
    <div class="audio-card_info" >
      <slot name="info">
        <div v-if="number" class="audio-card_number">{{ number }}.</div>
        <p class="audio-card_title">{{ title }}</p>
        <p v-if="description" class="audio-card_info_text">
          {{ description }}
        </p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type AudioCardVariant = 'default' | 'home' | 'menu' | 'map-popup'

const props = withDefaults(defineProps<{
  /** Variante visuelle de la carte */
  variant?: AudioCardVariant
  /** URL de l'image (fallback si pas de slot #image) */
  image?: string
  srcset?: string
  sizes?: string
  alt?: string
  /** Durée formatée (ex: "12'34") */
  duration?: string
  /** Numéro du lieu/épisode */
  number?: string | number | null
  title?: string
  description?: string
  descriptionBlack?: boolean
  /** Couleur de fond de la zone info */
  bgColor?: 'green' | 'red' | ''
  /** Afficher le bouton play */
  showButton?: boolean
}>(), {
  variant: 'default',
  image: '',
  srcset: '',
  sizes: '(max-width: 2400px) 100vw, 2400px',
  alt: '',
  duration: '',
  number: null,
  title: '',
  description: '',
  descriptionBlack: false,
  bgColor: '',
  showButton: true,
})

defineEmits<{
  play: []
}>()

const rootClass = computed(() => [
  'audio-card',
  `audio-card--${props.variant}`,
])

</script>

<style lang="scss">
</style>
