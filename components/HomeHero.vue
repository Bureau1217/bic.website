<template>
  <section class="hero">
    <!-- Côté gauche avec images -->
    <div class="hero_side">
      <img 
        v-if="cover?.url"
        :src="cover.url" 
        loading="lazy" 
        :alt="cover.alt || ''" 
        class="hero_image"
      >
      <div v-if="sideImages?.length" class="hero_image_wrapper">
        <img 
          v-for="(img, index) in sideImages" 
          :key="index"
          :src="img.url" 
          loading="lazy" 
          :alt="img.alt || ''" 
          class="hero_image-2"
        >
      </div>
    </div>

    <!-- Bloc texte principal -->
    <div class="block-text">
      <AppBlocks v-if="titre?.length" :blocks="titre" />
      <p v-if="subtitleText" class="block_p">{{ subtitleText }}</p>
      <slot></slot>
    </div>

    <!-- Audio card optionnel -->
    <div v-if="audioCard" class="audio-card is-home">
      <div class="audio-card_image_wrapper">
        <img 
          v-if="audioCard.image?.url"
          :src="audioCard.image.url" 
          loading="lazy" 
          :alt="audioCard.image.alt || ''" 
          class="audio-card_image"
        >
        <div class="audio-card_button">
          <img src="/images/Picto-Podcast-jaune.svg" loading="lazy" alt="" class="image">
          <div v-if="audioCard.duration" class="audio-card_time">{{ audioCard.duration }}</div>
        </div>
      </div>
      <div class="audio-card_info">
        <p class="audio-card_title">{{ audioCard.title }}</p>
        <p v-if="audioCard.description" class="carte-card_info_text is-black">{{ audioCard.description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  titre?: CMS_API_Block[]
  soustitre?: CMS_API_Block[]
  cover?: CMS_API_File | null
  sideImages?: CMS_API_File[]
  audioCard?: {
    title: string
    description?: string
    duration?: string
    image?: CMS_API_File | null
  } | null
}

const props = defineProps<Props>()

// Extraire le texte du soustitre depuis les blocks
const subtitleText = computed(() => {
  if (!props.soustitre?.length) return ''
  return props.soustitre
    .map(block => block.content?.text || '')
    .filter(Boolean)
    .join(' ')
})
</script>

<style lang="scss">
// Hero section styles
.hero {
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  display: flex;
  position: relative;
}

.hero_image {
  object-fit: cover;
  width: 100%;
  height: 40vw;
}

.hero_side {
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 40%;
  height: 100vh;
  display: flex;
  position: sticky;
  top: 0;
}

.hero_image_wrapper {
  height: var(--100);
  width: 100%;
  display: flex;
}

.hero_image-2 {
  object-fit: cover;
  width: 50%;
  height: 100%;
}

// Audio card pour le hero
.audio-card {
  z-index: 800;
  color: var(--white);
  flex-flow: column;
  justify-content: space-between;
  align-items: center;
  width: 16vw;
  height: 16vw;
  display: flex;
  position: fixed;
  inset: 80px 20px auto auto;

  &.is-home {
    position: absolute;
    left: 2vw;
    right: auto;
  }
}

.audio-card_image {
  width: var(--100);
  height: var(--100);
  object-fit: cover;
  position: relative;
}

.audio-card_image_wrapper {
  width: var(--100);
  height: 60%;
  position: relative;
}

.audio-card_button {
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  background-color: #00000080;
  border-radius: 100px;
  justify-content: center;
  align-items: center;
  padding: 5px 15px 5px 5px;
  display: flex;
  position: absolute;
  inset: auto auto 10px 10px;
}

.audio-card_time {
  color: var(--white);
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 12px;
}

.audio-card_title {
  margin-bottom: 0;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 16px;
  line-height: 1;
}

.audio-card_info {
  width: var(--100);
  height: var(--100);
  padding: var(--10);
  grid-column-gap: 5px;
  grid-row-gap: 5px;
  flex-flow: column;
  display: flex;
}

.carte-card_info_text {
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 16px;

  &.is-black {
    color: var(--black);
  }
}

// Media queries
@media screen and (max-width: 991px) {
  .hero {
    flex-flow: column;
    justify-content: flex-start;
    align-items: center;
  }

  .hero_image {
    height: 100vw;
  }

  .hero_side {
    width: 100%;
    height: auto;
    position: relative;
  }

  .hero_image_wrapper {
    display: none;
  }

  .audio-card {
    width: var(--100);
    flex-flow: row;
    height: 33.33vw;
    position: static;

    &.is-home {
      flex-flow: row;
      width: 100%;
      height: 33.33vw;
      position: relative;
      top: auto;
      left: auto;
    }
  }

  .audio-card_image_wrapper {
    height: var(--100);
    flex: none;
    width: 33.33%;
  }

  .audio-card_info {
    padding-top: var(--40);
    padding-right: var(--40);
    padding-left: var(--40);
    flex-flow: column;
    height: 100%;
  }
}

@media screen and (max-width: 479px) {
  .hero_side {
    padding-top: 60px;
  }

  .audio-card_info {
    padding-top: var(--10);
    padding-right: var(--10);
    padding-left: var(--10);
  }
}
</style>
