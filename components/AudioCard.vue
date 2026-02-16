<template>
  <div class="audio-card" :class="modifierClass">
    <div class="audio-card_image_wrapper">
      <img 
        :src="image" 
        loading="lazy" 
        :sizes="sizes || '(max-width: 2400px) 100vw, 2400px'" 
        :srcset="srcset" 
        :alt="alt || ''" 
        class="audio-card_image"
      >
      <div class="audio-card_button" @click="$emit('play')">
        <img src="/images/Picto-Podcast-jaune.svg" loading="lazy" alt="" class="image">
        <div class="audio-card_time">{{ duration }}</div>
      </div>
    </div>
    <div class="audio-card_info is-bg-green" :class="infoClass">
      <div v-if="number" class="audio-card_number">{{ number }}.</div>
      <p class="audio-card_title">{{ title }}</p>
      <p v-if="description" class="carte-card_info_text" :class="{ 'is-black': descriptionBlack }">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  image: {
    type: String,
    required: true
  },
  srcset: {
    type: String,
    default: ''
  },
  sizes: {
    type: String,
    default: '(max-width: 2400px) 100vw, 2400px'
  },
  alt: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    default: '12min'
  },
  number: {
    type: [String, Number],
    default: null
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  descriptionBlack: {
    type: Boolean,
    default: false
  },
  isHome: {
    type: Boolean,
    default: false
  },
  isCatalogue: {
    type: Boolean,
    default: false
  },
  isParcours: {
    type: Boolean,
    default: false
  },
  bgColor: {
    type: String,
    default: '' // 'green', 'red', or empty
  }
})

defineEmits(['play'])

const modifierClass = computed(() => ({
  'is-home': props.isHome,
  'is-catalogue': props.isCatalogue
}))

const infoClass = computed(() => ({
  'is-bg-green': props.bgColor === 'green',
  'is-bg-red': props.bgColor === 'red',
  'is-parcours': props.isParcours
}))
</script>

<style lang="scss">
</style>
