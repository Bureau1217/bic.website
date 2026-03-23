<template>
  <main class="v-parcours">
  
    <section class="page_header">
      <AppBlocks :blocks="data?.result?.parcours?.titre" />
      <AppBlocks :blocks="data?.result?.parcours?.soustitre" />
    </section>

    <AudioCard
      v-if="firstEpisode?.imagepodcast"
      variant="parcours-home"
      :entrance-animation="true"
      :track-audio-url="firstEpisode?.audio?.url || ''"
      :duration="firstEpisodeDuration || undefined"
      :title="firstEpisode?.title ?? ''"
      :description="firstEpisode?.texte || undefined"
      @play="onPlayFirstEpisode"
    >
      <template #image>
        <ResponsivePicture
          :image="firstEpisode.imagepodcast"
          sizes="240px"
          :alt="firstEpisode.imagepodcast?.alt ?? ''"
          picture-class="audio-card_image_rp"
        />
      </template>
    </AudioCard>

    <!-- Carte interactive SITG avec lieux Kirby -->
    <div class="map-wrapper">
      <MapView
        :center="[6.1432, 46.2044]"
        :zoom="4.7"
        :markers="mapMarkers"
      />
    </div>

    <Journal
      :title="data?.result?.references?.journal_titre || 'Notre journal'"
      :text="data?.result?.references?.journal_texte || ''"
      :button-text="data?.result?.references?.journal_bouton_texte || ''"
      :button-url="data?.result?.references?.journal_bouton_fichier?.url || ''"
      :button2-text="data?.result?.references?.journal_bouton2_texte || ''"
      :button2-url="data?.result?.references?.journal_bouton2_url || ''"
    />

    <Journal
      :title="data?.result?.references?.cartepostale_titre || 'Carte postale'"
      :text="data?.result?.references?.cartepostale_texte || ''"
      :button-text="data?.result?.references?.cartepostale_bouton_texte || ''"
      :button-url="data?.result?.references?.cartepostale_bouton_fichier?.url || ''"
      :button2-text="data?.result?.references?.cartepostale_bouton2_texte || ''"
      :button2-url="data?.result?.references?.cartepostale_bouton2_url || ''"
    />

    <Journal
      :title="data?.result?.references?.affiches_titre || 'Affiches'"
      :text="data?.result?.references?.affiches_texte || ''"
      :button-text="data?.result?.references?.affiches_bouton_texte || ''"
      :button-url="data?.result?.references?.affiches_bouton_fichier?.url || ''"
      :button2-text="data?.result?.references?.affiches_bouton2_texte || ''"
      :button2-url="data?.result?.references?.affiches_bouton2_url || ''"
    />

  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getImageSrc } from '~/types/image'

// FETCH DONNEES PODCAST (lieux pour la carte)
const { lieux, firstEpisode, parseGpsCoordinates, fetchPodcastData } = usePodcastData()
await fetchPodcastData()

// Lecteur audio global
const { playTrack } = useAudioPlayer()

// Durée audio du premier épisode
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

const onPlayFirstEpisode = () => {
  if (firstEpisode.value?.audio?.url) {
    playTrack({
      title: firstEpisode.value.title,
      subtitle: firstEpisode.value.texte,
      num: firstEpisode.value.num,
      audioUrl: firstEpisode.value.audio.url,
      slug: firstEpisode.value.slug,
      type: 'episode',
    })
  }
}

type ParcoursChild = CMS_API_PageItem & {
  template: string
}

type FetchData = CMS_API_Response & {
  result: {
    parcours: {
      title: string
      slug: string
      titre: CMS_API_Block[]
      soustitre: CMS_API_Block[]
      cover: CMS_API_File | null
      children: ParcoursChild[]
    }
    references: {
      journal_titre: string | null
      journal_texte: string | null
      journal_bouton_texte: string | null
      journal_bouton_fichier: CMS_API_File | null
      journal_bouton2_texte: string | null
      journal_bouton2_url: string | null
      cartepostale_titre: string | null
      cartepostale_texte: string | null
      cartepostale_bouton_texte: string | null
      cartepostale_bouton_fichier: CMS_API_File | null
      cartepostale_bouton2_texte: string | null
      cartepostale_bouton2_url: string | null
      affiches_titre: string | null
      affiches_texte: string | null
      affiches_bouton_texte: string | null
      affiches_bouton_fichier: CMS_API_File | null
      affiches_bouton2_texte: string | null
      affiches_bouton2_url: string | null
    }
  }
}

const { data } = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `site`,
    select: {
      parcours: {
        query: "site.find('parcours')",
        select: {
          title: true,
          slug: true,
          titre: 'page.titre.toBlocks',
          soustitre: 'page.soustitre.toBlocks',
          cover: {
            query: 'page.cover.toFile',
            select: {
              url: true,
              alt: true,
            },
          },
          children: {
            query: 'page.children()',
            select: {
              title: true,
              slug: true,
              template: true,
            },
          },
        },
      },
      references: {
        query: "site.find('ressources')",
        select: {
          journal_titre: 'page.journal_titre.value',
          journal_texte: 'page.journal_texte.value',
          journal_bouton_texte: 'page.journal_bouton_texte.value',
          journal_bouton_fichier: {
            query: 'page.journal_bouton_fichier.toFile',
            select: { url: true },
          },
          journal_bouton2_texte: 'page.journal_bouton2_texte.value',
          journal_bouton2_url: 'page.journal_bouton2_url.value',
          cartepostale_titre: 'page.cartepostale_titre.value',
          cartepostale_texte: 'page.cartepostale_texte.value',
          cartepostale_bouton_texte: 'page.cartepostale_bouton_texte.value',
          cartepostale_bouton_fichier: {
            query: 'page.cartepostale_bouton_fichier.toFile',
            select: { url: true },
          },
          cartepostale_bouton2_texte: 'page.cartepostale_bouton2_texte.value',
          cartepostale_bouton2_url: 'page.cartepostale_bouton2_url.value',
          affiches_titre: 'page.affiches_titre.value',
          affiches_texte: 'page.affiches_texte.value',
          affiches_bouton_texte: 'page.affiches_bouton_texte.value',
          affiches_bouton_fichier: {
            query: 'page.affiches_bouton_fichier.toFile',
            select: { url: true },
          },
          affiches_bouton2_texte: 'page.affiches_bouton2_texte.value',
          affiches_bouton2_url: 'page.affiches_bouton2_url.value',
        },
      },
    },
  },
})

useHead(() => ({
  title: data.value?.result?.parcours?.title || 'Parcours',
}))

// Transformer les lieux en markers pour MapView
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

@media screen and (max-width: 991px) {
  .map-wrapper {
    height: 70vh;
  }
}
</style>