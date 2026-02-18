<template>
  <main class="v-home">

    <HomeHero
      v-if="data?.result"
      :titre="data.result.home.titre"
      :soustitre="data.result.home.soustitre"
      :cover="data.result.home.cover"
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
    <div class="map-wrapper">
      <MapView
        :center="[6.1432, 46.2044]"
        :zoom="5"
        :markers="mapMarkers"
        id="map-home"
      />
    </div>

    <PortraitSlider />

    <ListeAgenda 
      v-if="data?.result?.ressources?.evenements" 
      title="Agenda" 
      :events="formattedEvents" 
    />

    <!-- Popup QR code : propose de lancer l'audio d'un épisode si ?qr=1&episode=slug -->
    <QrAudioPopup
      v-if="qrEpisode"
      v-model="showQrPopup"
      :title="qrEpisode.title"
      :image="getImageSrc(qrEpisode.imagepodcast)"
      @play="onPlayQrEpisode"
    />

  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResponsiveImage } from '~/types/image'
import { getImageSrc } from '~/types/image'

// FETCH DONNEES PODCAST
const { lieux, episodes, firstEpisode, parseGpsCoordinates, getEpisodeBySlug } = usePodcastData()

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
}

// FETCH DONNEES HOME
type HomePageData = CMS_API_Response & {
  result: {
    home: {
      title: string
      slug: string
      titre: CMS_API_Block[]
      soustitre: CMS_API_Block[]
      /** Cover au format responsive (historiaImage('cover')) */
      cover: ResponsiveImage | null
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
          // Image responsive null-safe : fallback + WebP + AVIF srcset
          // au lieu de l'URL brute du fichier original (souvent 5–12 Mo)
          cover: 'page.responsiveImage("cover", "cover")',
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
            },
          },
        },
      },
    },
  },
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
      description: event.description || ''
    }
  })
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
</style>
