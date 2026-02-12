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
      <AppBlocks v-if="soustitre?.length" :blocks="soustitre" class="block_p" />
    </div>

    <!-- Audio card optionnel -->
    <div v-if="audioCard" class="audio-card is-home" @click="onPlayAudio">
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
    audioUrl?: string
    slug?: string
    num?: string | number | null
    type?: 'episode' | 'lieu'
  } | null
}

const props = defineProps<Props>()

// Lecteur audio global (même player que le menu)
const { playTrack } = useAudioPlayer()

const onPlayAudio = () => {
  if (props.audioCard?.audioUrl) {
    playTrack({
      title: props.audioCard.title,
      num: props.audioCard.num ?? null,
      audioUrl: props.audioCard.audioUrl,
      slug: props.audioCard.slug ?? '',
      type: props.audioCard.type ?? 'episode',
    })
  }
}

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
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  display: flex;
  position: relative;
}

.hero_image {
  object-fit: cover;
  width: 100%;
  height: 100%;
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

}

@media screen and (max-width: 479px) {
  .hero_side {
    padding-top: 60px;
  }

}
</style>
