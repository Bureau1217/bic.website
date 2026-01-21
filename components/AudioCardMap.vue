<template>
  <div class="map-card">
    <div class="map-card_image_wrapper">
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
    <div class="map-card_info">
      <div class="audio-card_info_wrapper">
        <div class="audio-card_number">{{ number }}.</div>
        <p class="audio-card_title">{{ title }}</p>
      </div>
      <p v-if="description" class="audio-card_info_text">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
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
    default: '2'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})

defineEmits(['play'])
</script>

<style lang="scss">
</style>
