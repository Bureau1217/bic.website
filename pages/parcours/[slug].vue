<template>
  <main class="v-parcours-slug">

    <!-- Picto numéro du lieu (SVG, pas de responsive nécessaire) -->
    <img v-if="data?.result?.picto?.url" :src="data?.result?.picto?.url" loading="lazy"
      :alt="`Lieu n°${data?.result?.title}`" class="number">

    <!-- Image de fond / cover : responsive (AVIF + WebP + fallback) -->
    <ResponsivePicture
      v-if="data?.result?.cover"
      :image="data.result.cover"
      sizes="(max-width: 767px) 100vw, (max-width: 1400px) 85vw, 1200px"
      loading="lazy"
      fetchpriority="low"
      picture-class="background"
    />

    <!-- AudioCard : on passe l'image responsive + ses propriétés -->
    <AudioCard
      v-if="data?.result?.imagepodcast"
      variant="default"
      :entrance-animation="true"
      :track-audio-url="data?.result?.audio?.url || ''"
      :number="data?.result?.num ?? null"
      :title="data?.result?.title ?? ''"
      :duration="audioDuration"
      @play="onPlayAudio"
    >
      <template #image>
        <ResponsivePicture
          :image="data.result.imagepodcast"
          sizes="240px"
          :alt="data.result.imagepodcast?.alt ?? ''"
          picture-class="audio-card_image_rp"
        />
      </template>
      <template #info>
        <p class="audio-card_title"><span class="audio-card_number">{{ data?.result?.num ?? null }}.  </span> {{ data?.result?.title ?? '' }}</p>
      </template>
    </AudioCard>


    <!-- Layout: chaque row = une section .block-text -->
    <div class="blocks-container">
      <ContentBlockText v-for="(row, rowIndex) in layoutRows" :key="row.id ?? rowIndex" :blocks="getBlocksForRow(row)"
        :is-auto="rowIndex % 2 === 1" />
    </div>

    <section v-if="previousLieu || nextLieu" class="list lieu-pagination">
      <div class="list_wrapper">
        <div class="list_line lieu-pagination_line">
          <div class="lieu-pagination_links">
            <NuxtLink
              v-if="previousLieu"
              :to="`/parcours/${previousLieu.slug}`"
              class="lieu-pagination_link"
            >
              <span class="lieu-pagination_direction">← Lieu precedent</span>
              <p class="lieu-pagination_title">
                {{ previousLieu.num ? `${previousLieu.num}. ` : '' }}{{ previousLieu.title }}
              </p>
            </NuxtLink>

            <NuxtLink
              v-if="nextLieu"
              :to="`/parcours/${nextLieu.slug}`"
              class="lieu-pagination_link is-next"
            >
              
              <p class="lieu-pagination_title">
                {{ nextLieu.num ? `${nextLieu.num}. ` : '' }}{{ nextLieu.title }}
              </p>
              <span class="lieu-pagination_direction">Lieu suivant →</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Popup QR code : propose de lancer l'audio si ?qr=1 -->
    <QrAudioPopup v-if="data?.result?.audio?.url" v-model="showQrPopup" :title="data?.result?.title ?? ''"
      :image="getImageSrc(data?.result?.imagepodcast)" popup-type="lieu" @play="onPlayAudio" />

  </main>
</template>

<script setup lang="ts">
import type { ResponsiveImage } from '~/types/image'
import { getImageSrc } from '~/types/image'
const { lieux, fetchPodcastData } = usePodcastData()
await fetchPodcastData()

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
    num: string | number | null
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
      num: 'page.num',
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

useHead(() => ({
  title: data.value?.result?.title || 'Parcours',
}))

// QR: ouvrir le popup dès que l'audio est disponible, puis nettoyer l'URL
if (hasQrParam) {
  const stopQrWatch = watch(() => data.value?.result?.audio?.url, (audioUrl) => {
    if (audioUrl) {
      showQrPopup.value = true
      router.replace({ query: { ...route.query, qr: undefined } })
      stopQrWatch()
    }
  }, { immediate: true })
}


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

const currentLieuIndex = computed(() => {
  return lieux.value.findIndex(lieu => lieu.slug === slug)
})

const previousLieu = computed(() => {
  const index = currentLieuIndex.value
  if (index <= 0) return null
  return lieux.value[index - 1] ?? null
})

const nextLieu = computed(() => {
  const index = currentLieuIndex.value
  if (index < 0 || index >= lieux.value.length - 1) return null
  return lieux.value[index + 1] ?? null
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

.lieu-pagination {
  padding-top: var(--40);
}

.lieu-pagination_line {
  cursor: default;
  padding: var(--20) var(--40);
}

.lieu-pagination_links {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: var(--20);
}

.lieu-pagination_link {
  text-decoration: none;
  color: var(--red);
  padding: var(--15) var(--20);
  width: calc(50% - 10px);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}


.lieu-pagination_link.is-next {
  text-align: right;
}

.lieu-pagination_direction {
  display: inline-flex;
  align-items: center;
  gap: var(--10);
  margin-bottom: var(--10);
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 16px;
}

.lieu-pagination_title {
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

@media screen and (max-width: 991px) {
  .lieu-pagination_line {
    padding: var(--20);
  }

  .lieu-pagination_links {
    flex-direction: column;
  }

  .lieu-pagination_link {
    width: 100%;
  }

  .lieu-pagination_link.is-next {
    text-align: left;
  }
}

@media screen and (max-width: 479px) {
  .lieu-pagination_line {
    padding: var(--10);
  }
}
</style>
