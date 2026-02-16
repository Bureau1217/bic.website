<template>
  <section class="hero">
    <!-- Côté gauche avec images -->
    <div class="hero_side">
      <!-- Cover : image responsive (AVIF + WebP + fallback) -->
      <ResponsivePicture
        v-if="cover"
        :image="cover"
        sizes="(min-width: 2500px) 2500px, (min-width: 992px) 40vw, 100vw"
        loading="eager"
        picture-class="hero_image_picture"
      />
      <div class="hero_image_wrapper">
        <img src='/images/5-Université-et-éducation.jpg' loading="lazy" class="hero_image-2" alt="Picto Podcast jaune">
        <img src='/images/6-Restauration-et-gastronomie.jpg' loading="lazy" class="hero_image-2" alt="Picto Podcast jaune">
      </div>
    </div>

    <!-- Bloc texte principal -->
    <div class="block-text">
      <AppBlocks v-if="titre?.length" :blocks="titre" />
      <AppBlocks v-if="soustitre?.length" :blocks="soustitre" class="block_p" />
    </div>

    <!-- Audio card optionnel -->
    <AudioCard
      v-if="audioCard"
      variant="home"
      :duration="audioCard.duration"
      :title="audioCard.title"
      :description="audioCard.description"
      description-black
      @click="onPlayAudio"
      @play="onPlayAudio"
    >
      <template #image>
        <ResponsivePicture
          v-if="audioCard.image"
          :image="audioCard.image"
          sizes="240px"
          picture-class="audio-card_image_picture"
        />
      </template>
    </AudioCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResponsiveImage } from '~/types/image'

interface Props {
  titre?: CMS_API_Block[]
  soustitre?: CMS_API_Block[]
  /** Cover au format responsive (historiaImage('cover')) */
  cover?: ResponsiveImage | null
  sideImages?: CMS_API_File[]
  audioCard?: {
    title: string
    description?: string
    duration?: string
    /** Image podcast au format responsive (historiaImage('podcast')) */
    image?: ResponsiveImage | null
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

// Le <picture> prend toute la place du parent
.hero_image_picture {
  width: 100%;
  height: 100%;

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
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

// Audio card image picture : même style que l'image directe
.audio-card_image_picture {
  width: 100%;
  height: 100%;

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}

// Media queries
@media screen and (max-width: 991px) {
  .hero {
    flex-flow: column;
    justify-content: flex-start;
    align-items: center;
  }

  .hero_image_picture img {
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
