<template>
  <div class="block-text" :class="{ 'is-auto': isAuto }">
    <h1 v-if="title">{{ title }}</h1>
    <p v-if="text" class="block_p">{{ text }}</p>
    <slot></slot>
    <div v-if="image" class="block-image">
      <img 
        :src="image.src" 
        loading="lazy" 
        :sizes="image.sizes || '(max-width: 1840px) 100vw, 1840px'" 
        :srcset="image.srcset" 
        :alt="image.alt || ''" 
        class="block-image_image"
      >
      <p v-if="image.caption" class="block-image_legende">{{ image.caption }}</p>
    </div>
    <div v-if="slider && slider.length > 0" class="block-slider">
      <div class="block-slider_list">
        <div v-for="(item, index) in slider" :key="index" class="block-slider_item">
          <img 
            :src="item.src" 
            loading="lazy" 
            :sizes="item.sizes || '(max-width: 1840px) 100vw, 1840px'" 
            :srcset="item.srcset" 
            :alt="item.alt || ''" 
            class="block-image_image"
          >
          <p v-if="item.caption" class="block-image_legende">{{ item.caption }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  text: {
    type: String,
    default: ''
  },
  isAuto: {
    type: Boolean,
    default: false
  },
  image: {
    type: Object,
    default: null
  },
  slider: {
    type: Array,
    default: () => []
  }
})
</script>

<style lang="scss">
</style>
