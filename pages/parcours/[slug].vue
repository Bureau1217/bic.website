<template>
  <main class="v-parcours-slug">

    <!-- Picto numéro du lieu (SVG, pas de responsive nécessaire) -->
    <img v-if="data?.result?.picto?.url" :src="data?.result?.picto?.url" loading="lazy"
      :alt="`Lieu n°${data?.result?.title}`" class="number">

    <!-- Image de fond / cover : responsive (AVIF + WebP + fallback) -->
    <ResponsivePicture
      v-if="data?.result?.cover"
      :image="data.result.cover"
      sizes="(min-width: 2500px) 2500px, 100vw"
      loading="eager"
      picture-class="background"
    />

    <!-- AudioCard : on passe l'image responsive + ses propriétés -->
    <AudioCard
      v-if="data?.result?.imagepodcast"
      variant="default"
      :title="data?.result?.title ?? ''"
      :image="getImageSrc(data.result.imagepodcast)"
      :srcset="data.result.imagepodcast?.fallback?.srcset || ''"
      :sizes="data.result.imagepodcast?.sizes || '240px'"
      :alt="data.result.imagepodcast?.alt ?? ''"
      :duration="audioDuration"
      bg-color="green"
      @play="onPlayAudio"
    />


    <!-- Layout: chaque row = une section .block-text -->
    <div class="blocks-container">
      <ContentBlockText v-for="(row, rowIndex) in layoutRows" :key="row.id ?? rowIndex" :blocks="getBlocksForRow(row)"
        :is-auto="rowIndex % 2 === 1" />
    </div>

    <!-- Popup QR code : propose de lancer l'audio si ?qr=1 -->
    <QrAudioPopup v-if="data?.result?.audio?.url" v-model="showQrPopup" :title="data?.result?.title ?? ''"
      :image="getImageSrc(data?.result?.imagepodcast)" @play="onPlayAudio" />

  </main>
</template>

<script setup lang="ts">
import type { ResponsiveImage } from '~/types/image'
import { getImageSrc } from '~/types/image'

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

// Lecteur audio global (même player que le menu)
const { playTrack } = useAudioPlayer()

// Durée audio du lieu
const audioDuration = ref('')

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}'${secs.toString().padStart(2, '0')}`
}

// Popup QR code : détecte ?qr=1
const showQrPopup = ref(false)
const hasQrParam = route.query.qr === '1'

// Nettoyer l'URL immédiatement
if (hasQrParam) {
  router.replace({ query: { ...route.query, qr: undefined } })
}

const onPlayAudio = () => {
  const result = data.value?.result
  if (result?.audio?.url) {
    playTrack({
      title: result.title,
      num: null,
      audioUrl: result.audio.url,
      slug: result.slug,
      type: 'lieu',
    })
  }
}

/** Bloc avec contenu résolu (images au format responsive) */
type ResolvedBlock = {
  id: string
  type: string
  isHidden?: boolean
  content: {
    text?: string
    level?: string
    /** Image responsive (fallback + WebP + AVIF) depuis historiaImage('column') */
    image?: ResponsiveImage | null
    /** Images de galerie au format responsive */
    images?: ResponsiveImage[]
    caption?: string
    alt?: string
    [key: string]: unknown
  }
}

/** Une row du layout avec fichiers résolus */
type LayoutRow = {
  id?: string
  columns?: {
    id?: string
    width?: string
    blocks?: ResolvedBlock[]
  }[]
}

type FetchData = CMS_API_Response & {
  result: {
    title: string
    slug: string
    template: string
    layout?: LayoutRow[] | null
    /** Cover au format responsive */
    cover?: ResponsiveImage | null
    picto?: CMS_API_File | null  // SVG, pas de responsive
    /** Image podcast au format responsive */
    imagepodcast?: ResponsiveImage | null
    audio?: CMS_API_File | null
  } | null
}

const { data } = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `site.find('parcours').childrenAndDrafts().published().find('${slug}')`,
    select: {
      title: true,
      slug: true,
      template: true,
      // Layout : les images sont déjà en format responsive via layoutWithResolvedFiles
      layout: 'page.layoutWithResolvedFiles',
      // Cover responsive null-safe (AVIF + WebP + fallback)
      cover: 'page.responsiveImage("cover", "cover")',
      // Picto = SVG, pas besoin de responsive
      picto: {
        query: 'page.picto.toFile',
        select: { url: true, alt: true },
      },
      // Image podcast responsive null-safe
      imagepodcast: 'page.responsiveImage("imagepodcast", "podcast")',
      audio: {
        query: 'page.content.audio.toFile',
        select: { url: true, filename: true },
      },
    },
  },
})


// Charger la durée audio quand les données arrivent
watch(() => data.value?.result?.audio?.url, (audioUrl) => {
  if (audioUrl && !audioDuration.value) {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && isFinite(audio.duration)) {
        audioDuration.value = formatDuration(audio.duration)
      }
    })
    audio.src = audioUrl
  }
}, { immediate: true })

// Rows du layout
const layoutRows = computed((): LayoutRow[] => {
  const layout = data.value?.result?.layout
  if (!layout) return []
  return Array.isArray(layout) ? layout : []
})

// Extraire tous les blocs d'une row (toutes colonnes), filtre les blocs cachés
function getBlocksForRow(row: LayoutRow): ResolvedBlock[] {
  return (row.columns ?? [])
    .flatMap((c) => c.blocks ?? [])
    .filter(block => !block.isHidden)
}
</script>

<style lang="scss">
.v-parcours-slug {
  position: relative;
}
</style>
