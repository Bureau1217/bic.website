<template>
  <div v-if="portraits.length" class="portrait">
    <div class="portrait_title_wrapper">
      <h1 class="portrait_title">{{ title }}</h1>
    </div>
    <div class="portrait_slider">
      <Swiper
        :modules="[Navigation, Autoplay]"
        :slides-per-view="3"
        :space-between="0"
        :navigation="true"
        :autoplay="{
          delay: 5000,
          disableOnInteraction: true,
        }"
        :loop="true"
        class="portrait_swiper"
        @swiper="onSwiper"
      >
        <SwiperSlide 
          v-for="(portrait, index) in portraits" 
          :key="index" 
          class="portrait_slide"
        >
          <NuxtLink 
            :to="portrait.link?.slug ? `/parcours/${portrait.link.slug}` : '#'"
            class="portrait_card_link"
          >
            <img 
              :src="portrait.image?.url" 
              loading="lazy" 
              :alt="portrait.image?.alt || portrait.nom || ''" 
              class="portrait_card_image"
            >
            <div class="portrait_card_info">
              <p class="portrait_name">{{ portrait.nom }}</p>
              <p class="portrait_description">{{ portrait.description }}</p>
            </div>
          </NuxtLink>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Autoplay } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'

const { allPortraits } = usePodcastData()

defineProps({
  title: {
    type: String,
    default: 'Portraits'
  }
})

const portraits = computed(() => allPortraits.value)

const swiperInstance = ref<SwiperType | null>(null)

const onSwiper = (swiper: SwiperType) => {
  swiperInstance.value = swiper
}
</script>

<style lang="scss">
// Portrait Slider Component Styles
.portrait {
  width: var(--100);
  background-color: var(--red);
  display: flex;
}

.portrait_slider {
  width: 60%;
  position: relative;
}

.portrait_swiper {
  width: 100%;
  height: 100%;

  .swiper-button-prev,
  .swiper-button-next {
    color: var(--yellow);
  }
}

.portrait_slide {
  display: flex;
  flex-direction: column;
}

.portrait_card_link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  width: 100%;
  height: 100%;
}

.portrait_card_image {
  width: var(--100);
  object-fit: cover;
  height: 20vw;
  flex-shrink: 0;
}

.portrait_card_info {
  padding: var(--40) var(--10) var(--20);
  background-color: var(--green);
  height: 100%;
}

.portrait_slide:nth-child(even) .portrait_card_info {
  background-color: var(--blue);
}

.portrait_title_wrapper {
  padding-top: var(--40);
  padding-right: var(--40);
  padding-left: var(--40);
  width: 40%;
}

.portrait_title {
  color: var(--white);
}

.portrait_name {
  color: var(--yellow);
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
}

.portrait_description {
  color: var(--white);
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 16px;
}

// Media queries
@media screen and (max-width: 991px) {
  .portrait {
    flex-flow: column;
  }

  .portrait_card_image {
    height: 33.33vw;
  }

  .portrait_title_wrapper {
    width: var(--100);
  }

  .portrait_slider {
    width: 100%;
  }
}

@media screen and (max-width: 479px) {
  .portrait_title_wrapper {
    padding-right: var(--10);
    padding-left: var(--10);
  }
}
</style>
