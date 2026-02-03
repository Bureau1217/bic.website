<template>
  <div v-if="images?.length" class="block-slider">
    <Swiper
      :modules="[Navigation, Pagination]"
      :slides-per-view="1"
      :space-between="20"
      :navigation="true"
      :pagination="{ clickable: true }"
      class="block-slider_swiper"
    >
      <SwiperSlide v-for="(img, index) in images" :key="index" class="block-slider_item">
        <img 
          :src="img.url" 
          loading="lazy" 
          :alt="img.alt || ''" 
          class="block-image_image"
        >
      </SwiperSlide>
    </Swiper>
    <p v-if="caption" class="block-image_legende">{{ caption }}</p>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

defineProps<{
  images?: { url: string; alt?: string }[]
  caption?: string
}>()
</script>

<style lang="scss">
.block-slider {
  overflow: hidden;
  width: var(--100);

  .block-slider_swiper {
    width: 100%;
    height: 38vw;
    
    .swiper-button-prev,
    .swiper-button-next {
      color: var(--red);
    }
    
    .swiper-pagination-bullet-active {
      background: var(--red);
    }
  }

  .block-slider_item {
    width: var(--100);
    flex: none;
    display: flex;
    flex-direction: column;
    
    .block-image_image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
  }

  .block-image_legende {
    margin-top: var(--10);
    color: var(--red);
    font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
    font-size: 16px;
  }
}
</style>
