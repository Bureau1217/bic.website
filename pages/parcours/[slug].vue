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
        <p class="audio-card_title audio-card_title--split">
          <span class="audio-card_number">{{ data?.result?.num ?? null }}.</span>
          <span class="audio-card_title_text">{{ data?.result?.title ?? '' }}</span>
        </p>
      </template>
    </AudioCard>

    <section v-if="previousLieu || nextLieu" class="list lieu-pagination lieu-pagination--top">
      <div class="list_wrapper">
        <div class="list_line lieu-pagination_line">
          <div class="lieu-pagination_links">
            <NuxtLink
              v-if="previousLieu"
              :to="`/parcours/${previousLieu.slug}`"
              class="lieu-pagination_link"
            >
              <span class="lieu-pagination_direction">←</span>
              <p class="lieu-pagination_title">
                Lieu précédent
              </p>
            </NuxtLink>

            <NuxtLink
              v-if="nextLieu"
              :to="`/parcours/${nextLieu.slug}`"
              class="lieu-pagination_link is-next"
            >
              <p class="lieu-pagination_title">
                Lieu suivant
              </p>
              <span class="lieu-pagination_direction">→</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>


    <!-- Layout: chaque row = une section .block-text -->
    <div class="blocks-container">
      <ContentBlockText v-for="(row, rowIndex) in layoutRows" :key="row.id ?? rowIndex" :blocks="getBlocksForRow(row)"
        :is-auto="rowIndex % 2 === 1" />
    </div>

    <section v-if="previousLieu || nextLieu" class="list lieu-pagination lieu-pagination--bottom">
      <div class="list_wrapper">
        <div class="list_line lieu-pagination_line">
          <div class="lieu-pagination_links">
            <NuxtLink
              v-if="previousLieu"
              :to="`/parcours/${previousLieu.slug}`"
              class="lieu-pagination_link"
            >
              <span class="lieu-pagination_direction">←</span>
              <p class="lieu-pagination_title">
                Lieu précédent
              </p>
            </NuxtLink>

            <NuxtLink
              v-if="nextLieu"
              :to="`/parcours/${nextLieu.slug}`"
              class="lieu-pagination_link is-next"
            >
              
              <p class="lieu-pagination_title">
                Lieu suivant
              </p>
              <span class="lieu-pagination_direction">→</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Popup QR code : propose de lancer l'audio si ?qr=1 -->
    <QrAudioPopup v-if="data?.result?.audio?.url" v-model="showQrPopup" :title="data?.result?.title ?? ''"
      :image="getImageSrc(data?.result?.imagepodcast)" popup-type="lieu" @play="onPlayAudio" />

    <button
      class="lieu-map-fab"
      type="button"
      aria-label="Ouvrir la carte"
      @click="openMapOverlay"
    >
      <img src="/images/icon-map.svg" alt="" aria-hidden="true" class="lieu-map-fab_icon">
    </button>

    <Teleport to="body">
      <div
        v-show="hasOpenedMapOverlay"
        class="lieu-map-overlay"
        :class="{ 'is-open': isMapOverlayOpen }"
        role="dialog"
        :aria-modal="isMapOverlayOpen ? 'true' : 'false'"
        :aria-hidden="isMapOverlayOpen ? 'false' : 'true'"
        aria-label="Carte des lieux"
      >
        <button
          class="lieu-map-overlay_close"
          type="button"
          aria-label="Fermer la carte"
          @click="closeMapOverlay"
        >
          &#10005;
        </button>

        <div class="lieu-map-overlay_map">
          <component
            :is="AsyncMapView"
            v-if="hasOpenedMapOverlay"
            :center="mapCenter"
            :zoom="mapZoom"
            :markers="mapMarkers"
            :highlighted-marker-id="slug"
            @request-close="closeMapOverlay"
          />
        </div>
      </div>
    </Teleport>

  </main>
</template>

<script setup lang="ts">
import { defineAsyncComponent, nextTick } from 'vue'
import type { ResponsiveImage } from '~/types/image'
import { getImageSrc } from '~/types/image'
const { lieux, parseGpsCoordinates, fetchPodcastData } = usePodcastData()
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

const AsyncMapView = defineAsyncComponent(() => import('~/components/MapView.client.vue'))
const isMapOverlayOpen = ref(false)
const hasOpenedMapOverlay = ref(false)
const mapZoom = ref(4.7)

const updateMapZoom = () => {
  if (typeof window === 'undefined') return

  if (window.matchMedia('(max-width: 767px)').matches) {
    mapZoom.value = 2
    return
  }

  if (window.matchMedia('(max-width: 991px)').matches) {
    mapZoom.value = 2
    return
  }

  mapZoom.value = 4.5
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

const currentLieu = computed(() => {
  const index = currentLieuIndex.value
  if (index < 0) return null
  return lieux.value[index] ?? null
})

const mapCenter = computed<[number, number]>(() => {
  const currentCoordinates = parseGpsCoordinates(currentLieu.value?.gps ?? null)
  if (currentCoordinates) {
    return [currentCoordinates.lng, currentCoordinates.lat]
  }
  return [6.1432, 46.2044]
})

const mapMarkers = computed(() => {
  if (!lieux.value?.length) return []

  return lieux.value
    .map((lieu, index) => {
      const coords = parseGpsCoordinates(lieu.gps)
      if (!coords) return null

      return {
        id: lieu.slug || index,
        coordinates: [coords.lng, coords.lat] as [number, number],
        title: lieu.title,
        slug: lieu.slug,
        number: lieu.num || (index + 1),
        image: getImageSrc(lieu.imagepodcast),
        icon: lieu.picto?.url,
        adresse: lieu.adresse || undefined,
      }
    })
    .filter(Boolean) as Array<{
      id: string | number
      coordinates: [number, number]
      title: string
      slug?: string
      number?: string | number
      image?: string
      icon?: string
      adresse?: string
    }>
})

const openMapOverlay = () => {
  hasOpenedMapOverlay.value = true
  isMapOverlayOpen.value = true
}

const closeMapOverlay = () => {
  isMapOverlayOpen.value = false
}

// Extraire tous les blocs d'une row (toutes colonnes), filtre les blocs cachés
function getBlocksForRow(row: LayoutRow): ResolvedBlock[] {
  return (row.columns ?? [])
    .flatMap((c) => c.blocks ?? [])
    .filter(block => !block.isHidden)
}

watch(isMapOverlayOpen, (isOpen) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onMounted(() => {
  updateMapZoom()
  window.addEventListener('resize', updateMapZoom)
})

// Scroll vers l'ancre après le chargement des données
const scrollToAnchor = () => {
  if (!route.hash) return

  let attempts = 0
  const maxAttempts = 20

  const tryScroll = () => {
    const element = document.querySelector(route.hash)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else if (attempts < maxAttempts) {
      attempts++
      setTimeout(tryScroll, 100)
    }
  }

  tryScroll()
}

watch(layoutRows, (rows) => {
  if (rows?.length && route.hash) {
    scrollToAnchor()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMapZoom)
  if (typeof document === 'undefined') return
  document.body.style.overflow = ''
})
</script>

<style lang="scss">
.v-parcours-slug {
  position: relative;
}

.lieu-map-fab {
  position: fixed;
  right: 0;
  bottom: 70px;
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 0;
  background: var(--red);
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  padding: 0;
}

.lieu-map-fab_icon {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.lieu-map-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100svh;
  background: var(--white);
  z-index: 10000;
  display: none;
}

.lieu-map-overlay.is-open {
  display: block;
}

.lieu-map-overlay_map {
  width: 100%;
  height: 100%;
}

.lieu-map-overlay_close {
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 0;
  background: var(--red);
  color: var(--white);
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lieu-pagination {
  padding: 0 !important;
  margin: 0 !important;
}

.lieu-pagination--top {
  display: none;
}

.lieu-pagination_line {
  cursor: default;
  padding: 0;
  margin: 0;
}

.lieu-pagination_links {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 0;
}

.lieu-pagination_link {
  text-decoration: none;
  color: var(--red);
  width: 50%;
  display: flex;
  gap: var(--10);
  padding: var(--10) var(--40);
  margin: 0;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  transition: transform 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}

.lieu-pagination_link:hover {
  background-color: var(--green);
  color: var(--white);
}


.lieu-pagination_link.is-next {
  text-align: right;
  margin-left: auto;
  justify-content: flex-end;

  p {
    text-align: right;
  }
}

.lieu-pagination_direction {
  line-height: 0;
  font-size: 30px;
  padding-top: 10px;
}

.lieu-pagination_title {
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}




@media screen and (max-width: 991px) {
  .lieu-map-fab {
    display: flex;
  }

  .lieu-pagination--top {
    display: block;
  }


  .lieu-pagination_link.is-next {
    text-align: left;
  }
}

@media screen and (max-width: 767px) {

  .lieu-pagination_line {
     gap: 0;
  }

  .lieu-pagination_link {
    padding-right: 0;
    width: 50%;
  }

  .lieu-pagination_title {
      font-size: 16px;
}

.lieu-pagination_direction {
  padding-top: 7px;
}

  .lieu-pagination_link.is-next {
    padding-left: 0;
    padding-right: 40px;
  }

}

@media screen and (max-width: 479px) {

  .lieu-map-fab {
    width: 60px;
    height: 60px;
    bottom: 100px;
  }

  .lieu-map-fab_icon {
    width: 26px;
    height: 26px;
  }

  .lieu-pagination_link {
    width: 100%;
    align-items: flex-start;
    text-align: left;
    flex-direction: column;
    justify-content: flex-end;
    padding: 10px 10px;
    gap: 20px;
  }

  .lieu-pagination_link.is-next {
    align-items: flex-end;
    text-align: left;
    flex-direction: column;
    padding-right: 10px;

    .lieu-pagination_direction {
      order: -1;
    }
  }

}
</style>
