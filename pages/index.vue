<template>
  <main class="v-home">
    <HomeLoader :visible="isLoading" :message="homeLoaderMessage" />

    <HomeHero
      v-if="data?.result"
      :titre="data.result.home.titre"
      :soustitre="data.result.home.soustitre"
      :cover="data.result.home.cover"
      :image1="data.result.home.image1"
      :image2="data.result.home.image2"
      :audio-card="firstEpisode ? {
        title: firstEpisode.title,
        description: firstEpisode.texte || undefined,
        duration: firstEpisodeDuration || undefined,
        image: firstEpisode.imagepodcast,
        audioUrl: firstEpisode.audio?.url,
        slug: firstEpisode.slug,
        num: firstEpisode.num,
        type: 'episode' as const,
      } : undefined"
    />

    <!-- Carte interactive SITG avec lieux Kirby -->
    <div ref="mapSectionRef" class="map-wrapper">
      <component
        :is="AsyncMapView"
        v-if="shouldMountMap"
        :center="[6.1432, 46.2044]"
        :zoom="mapZoom"
        :markers="mapMarkers"
        id="map-home"
      />
      <div v-else class="map-placeholder" aria-hidden="true"></div>
    </div>

    <div ref="portraitSectionRef" class="portrait-wrapper">
      <PortraitSlider v-if="shouldMountPortraitSlider" />
      <div v-else class="portrait-placeholder" aria-hidden="true"></div>
    </div>

    <ListeAgenda 
      v-if="data?.result?.ressources?.evenements" 
      title="Agenda" 
      :events="formattedEvents" 
    />

    <ListEdito
      v-if="formattedEdito.length"
      title="Édito"
      :items="formattedEdito"
    />

    <!-- Popup QR code : propose de lancer l'audio d'un épisode si ?qr=1&episode=slug -->
    <QrAudioPopup
      v-if="qrEpisode"
      v-model="showQrPopup"
      :title="qrEpisode.title"
      :image="getImageSrc(qrEpisode.imagepodcast)"
      popup-type="episode"
      @play="onPlayQrEpisode"
    />

  </main>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted } from 'vue'
import type { ResponsiveImage } from '~/types/image'
import { getImageSrc } from '~/types/image'

const isLoading = ref(false)
const nuxtApp = useNuxtApp()
const isInitialHydration = nuxtApp.isHydrating
let loaderTimer: ReturnType<typeof setTimeout> | null = null
let previousBodyOverflow: string | null = null

const lockBodyScroll = () => {
  if (typeof document === 'undefined' || previousBodyOverflow !== null) return
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

const unlockBodyScroll = () => {
  if (typeof document === 'undefined' || previousBodyOverflow === null) return
  document.body.style.overflow = previousBodyOverflow
  previousBodyOverflow = null
}

const shouldShowHomeLoader = (): boolean => {
  if (typeof window === 'undefined') return false
  if (!isInitialHydration) return false

  const referrer = document.referrer
  const isExternalReferrer = !referrer || !referrer.startsWith(window.location.origin)
  const navigationEntry = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const isReload = navigationEntry?.type === 'reload'

  return isReload || isExternalReferrer
}

// FETCH DONNEES PODCAST
const { lieux, episodes, firstEpisode, parseGpsCoordinates, getEpisodeBySlug, fetchPodcastData } = usePodcastData()
void fetchPodcastData()

const AsyncMapView = defineAsyncComponent(() => import('~/components/MapView.client.vue'))
const mapSectionRef = ref<HTMLElement | null>(null)
const portraitSectionRef = ref<HTMLElement | null>(null)
const shouldMountMap = ref(false)
const shouldMountPortraitSlider = ref(false)
const mapZoom = ref(4.7)
let sectionsObserver: IntersectionObserver | null = null

const updateMapZoom = () => {
  if (typeof window === 'undefined') return

  if (window.matchMedia('(max-width: 767px)').matches) {
    mapZoom.value = 3
    return
  }

  if (window.matchMedia('(max-width: 991px)').matches) {
    mapZoom.value = 4.5
    return
  }

  mapZoom.value = 4.7
}

// Lecteur audio global
const { playTrack } = useAudioPlayer()

// Durée audio du premier épisode (hero)
const firstEpisodeDuration = ref('')

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}'${secs.toString().padStart(2, '0')}`
}

watch(firstEpisode, (ep) => {
  if (ep?.audio?.url && !firstEpisodeDuration.value) {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && isFinite(audio.duration)) {
        firstEpisodeDuration.value = formatDuration(audio.duration)
      }
    })
    audio.src = ep.audio.url
  }
}, { immediate: true })

onMounted(() => {
  updateMapZoom()
  window.addEventListener('resize', updateMapZoom)

  if (shouldShowHomeLoader()) {
    isLoading.value = true
    lockBodyScroll()
    loaderTimer = window.setTimeout(() => {
      isLoading.value = false
      unlockBodyScroll()
      loaderTimer = null
    }, 3000)
  }

  sectionsObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue

        if (entry.target === mapSectionRef.value) {
          shouldMountMap.value = true
          sectionsObserver?.unobserve(entry.target)
          continue
        }

        if (entry.target === portraitSectionRef.value) {
          shouldMountPortraitSlider.value = true
          sectionsObserver?.unobserve(entry.target)
        }
      }
    },
    {
      root: null,
      rootMargin: '300px 0px',
      threshold: 0.01,
    },
  )

  if (mapSectionRef.value) {
    sectionsObserver.observe(mapSectionRef.value)
  }

  if (portraitSectionRef.value) {
    sectionsObserver.observe(portraitSectionRef.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMapZoom)

  if (loaderTimer) {
    clearTimeout(loaderTimer)
    loaderTimer = null
  }
  unlockBodyScroll()

  sectionsObserver?.disconnect()
  sectionsObserver = null
})

// QR Code : détection du paramètre ?qr=1&episode=slug
const route = useRoute()
const router = useRouter()

const showQrPopup = ref(false)
const qrEpisode = ref<EpisodeData | null>(null)

const hasQrParam = route.query.qr === '1'
const qrEpisodeSlug = route.query.episode as string | undefined

// Nettoyer l'URL immédiatement
if (hasQrParam) {
  router.replace({ query: { ...route.query, qr: undefined, episode: undefined } })
}

// Ouvrir le popup une fois les données épisodes chargées
if (hasQrParam && qrEpisodeSlug) {
  watch(() => episodes.value, (eps) => {
    if (eps.length > 0 && !qrEpisode.value) {
      const ep = getEpisodeBySlug(qrEpisodeSlug)
      if (ep?.audio?.url) {
        qrEpisode.value = ep
        showQrPopup.value = true
      }
    }
  }, { immediate: true })
}

// Lancer l'audio de l'épisode QR
const onPlayQrEpisode = () => {
  if (qrEpisode.value?.audio?.url) {
    playTrack({
      title: qrEpisode.value.title,
      subtitle: qrEpisode.value.texte,
      num: qrEpisode.value.num,
      audioUrl: qrEpisode.value.audio.url,
      slug: qrEpisode.value.slug,
      type: 'episode',
    })
  }
}


// TYPES
type ReferenceEvent = {
  date: string | null
  heuredebut: string | null
  heurefin: string | null
  nom: string | null
  description: string | null
  lieu: string | null
  lien: string | null
}

type HomeEditoItem = {
  nom: string | null
  titre: string | null
  description: string | null
}

// FETCH DONNEES HOME
type HomePageData = CMS_API_Response & {
  result: {
    home: {
      title: string
      slug: string
      titre: CMS_API_Block[]
      soustitre: CMS_API_Block[]
      loader_message: string | null
      edito: HomeEditoItem[]
      /** Cover au format responsive (historiaImage('cover')) */
      cover: ResponsiveImage | null
      /** Images secondaires du hero */
      image1: ResponsiveImage | null
      image2: ResponsiveImage | null
    }
    ressources: {
      evenements: ReferenceEvent[]
    }
  }
}

// Fetch des données de la page home + événements de la page ressources
const { data } = await useFetch<HomePageData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: 'site',
    select: {
      home: {
        query: "site.find('home')",
        select: {
          title: true,
          slug: true,
          titre: 'page.titre.toBlocks',
          soustitre: 'page.soustitre.toBlocks',
          loader_message: true,
          edito: {
            query: 'page.edito.toStructure()',
            select: {
              nom: 'structureItem.nom.value',
              titre: 'structureItem.titre.value',
              description: 'structureItem.description.value',
            },
          },
          // Image responsive null-safe : fallback + WebP + AVIF srcset
          // au lieu de l'URL brute du fichier original (souvent 5–12 Mo)
          cover: 'page.responsiveImage("cover", "cover")',
          image1: 'page.responsiveImage("image1", "cover")',
          image2: 'page.responsiveImage("image2", "cover")',
        },
      },
      ressources: {
        query: "site.find('ressources')",
        select: {
          evenements: {
            query: 'page.evenements.toStructure()',
            select: {
              date: 'structureItem.date.value',
              heuredebut: 'structureItem.heuredebut.value',
              heurefin: 'structureItem.heurefin.value',
              nom: 'structureItem.nom.value',
              description: 'structureItem.description.value',
              lieu: 'structureItem.lieu.value',
              lien: 'structureItem.lien.value',
            },
          },
        },
      },
    },
  },
})

useHead({
  title: 'Accueil',
})

const homeLoaderMessage = computed(() => {
  const message = data.value?.result?.home?.loader_message?.trim()
  return message || "Chargement de l'experience immersive..."
})

// Transformer les événements du CMS pour le composant ListeAgenda
const formattedEvents = computed(() => {
  const events = data.value?.result?.ressources?.evenements
  if (!events) return []
  
  return events.map((event) => {
    // Formater la date avec les heures
    let dateStr = event.date || ''
    if (event.heuredebut) {
      dateStr += ` - ${event.heuredebut}`
    }
    if (event.heurefin) {
      dateStr += ` à ${event.heurefin}`
    }
    
    return {
      date: dateStr,
      title: event.nom || '',
      venue: event.lieu || '',
      link: event.lien || '',
      description: event.description || ''
    }
  })
})

const formattedEdito = computed(() => {
  const edito = data.value?.result?.home?.edito
  if (!edito?.length) return []

  return edito.map((item) => ({
    name: item.nom || '',
    title: item.titre || '',
    description: item.description || '',
  }))
})

// Transformer les lieux en markers pour MapView
// Les markers utilisent l'URL de fallback (string) pour la carte
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
        // Extraire l'URL de fallback depuis le format responsive
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
</script>

<style lang="scss" scoped>
.map-wrapper {
  height: 100vh;
  width: 100%;
}

.map-placeholder,
.portrait-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #f3f3f3 0%, #e9e9e9 100%);
}

.portrait-placeholder {
  min-height: 60vh;
}

@media screen and (max-width: 991px) {
  .map-wrapper {
    height: 70vh;
  }
}
</style>
