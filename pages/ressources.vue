<template>
  <main class="v-ressources">
    <Menu />
    <section class="page_header">
      <AppBlocks :blocks="data?.result?.ressources?.titre" />
      <AppBlocks :blocks="data?.result?.ressources?.soustitre" />
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


    <ListeAgenda 
      v-if="data?.result?.ressources?.evenements" 
      title="Agenda" 
      :events="formattedEvents" 
    />

    <Journal
      anchor-id="journal"
      :title="data?.result?.ressources?.journal_titre || 'Notre journal'"
      :text="data?.result?.ressources?.journal_texte || ''"
      :button-text="data?.result?.ressources?.journal_bouton_texte || ''"
      :button-url="data?.result?.ressources?.journal_bouton_fichier?.url || ''"
      :button2-text="data?.result?.ressources?.journal_bouton2_texte || ''"
      :button2-url="data?.result?.ressources?.journal_bouton2_url || ''"
    />

    <Journal
      :title="data?.result?.ressources?.cartepostale_titre || 'Carte postale'"
      :text="data?.result?.ressources?.cartepostale_texte || ''"
      :button-text="data?.result?.ressources?.cartepostale_bouton_texte || ''"
      :button-url="data?.result?.ressources?.cartepostale_bouton_fichier?.url || ''"
      :button2-text="data?.result?.ressources?.cartepostale_bouton2_texte || ''"
      :button2-url="data?.result?.ressources?.cartepostale_bouton2_url || ''"
    />

    <Journal
      :title="data?.result?.ressources?.affiches_titre || 'Affiches'"
      :text="data?.result?.ressources?.affiches_texte || ''"
      :button-text="data?.result?.ressources?.affiches_bouton_texte || ''"
      :button-url="data?.result?.ressources?.affiches_bouton_fichier?.url || ''"
      :button2-text="data?.result?.ressources?.affiches_bouton2_texte || ''"
      :button2-url="data?.result?.ressources?.affiches_bouton2_url || ''"
    />

    <Journal
      :title="data?.result?.ressources?.azulejos_titre || 'Atelier Azulejos'"
      :text="data?.result?.ressources?.azulejos_texte || ''"
      :video-url="data?.result?.ressources?.azulejos_video?.url || ''"
    />

    <ListeRessource 
      v-if="data?.result?.ressources?.ressources" 
      title="Références" 
      :categories="formattedRessources" 
    />

  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Journal from '~/components/Journal.vue'

// FETCH DONNEES PODCAST (épisode 1)
const { firstEpisode, fetchPodcastData } = usePodcastData()
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

// TYPES
type ReferenceRessource = {
  nom: string
  tag: string | string[] | null
  lien: string | null
  fichier?: CMS_API_File | null
}

type ReferenceEvent = {
  date: string | null
  heuredebut: string | null
  heurefin: string | null
  nom: string | null
  description: string | null
  lieu: string | null
  lien: string | null
}


type FetchData = CMS_API_Response & {
  result: {
    ressources: {
      title: string
      slug: string
      titre: CMS_API_Block[]
      soustitre: CMS_API_Block[]
      cover: CMS_API_File | null
      ressources: ReferenceRessource[]
      evenements: ReferenceEvent[]
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
      azulejos_titre: string | null
      azulejos_texte: string | null
      azulejos_video: CMS_API_File | null
      remerciement_title: string | null
      remerciement_text: string | null
      /** SEO fields */
      metaDescription: string | null
      ogTitle: string | null
      ogDescription: string | null
      ogImage: { url: string } | null
    }
  }
}

// FETCH DONNEES RESOURCES
const { data } = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `site`,
    select: {
      ressources: {
        query: "site.find('ressources')",
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
          ressources: {
            query: 'page.ressources.toStructure()',
            select: {
              nom: 'structureItem.nom.value',
              tag: 'structureItem.tag.value',
              lien: 'structureItem.lien.value',
              fichier: {
                query: 'structureItem.fichier.toFile',
                select: {
                  url: true,
                  filename: true,
                },
              },
            },
          },
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
          azulejos_titre: 'page.azulejos_titre.value',
          azulejos_texte: 'page.azulejos_texte.value',
          azulejos_video: {
            query: 'page.azulejos_video.toFile',
            select: { url: true },
          },
          remerciement_title: 'page.remerciement_title.value',
          remerciement_text: 'page.remerciement_text.value',
          // SEO fields
          metaDescription: 'page.metaDescription.value',
          ogTitle: 'page.metaTitle.value',
          ogDescription: 'page.ogDescription.value',
          ogImage: {
            query: 'page.ogImage.toFile',
            select: { url: true },
          },
        },
      },
    },
  },
})

// Normaliser les URLs d'images du CMS (WhatsApp exige des URLs absolues)
const { normalizeUrl } = useImageUrl()

useHead(() => ({
  title: data.value?.result?.ressources?.title || 'Ressources',
  meta: [
    {
      name: 'description',
      content: data.value?.result?.ressources?.metaDescription || '',
    },
    {
      property: 'og:title',
      content: data.value?.result?.ressources?.ogTitle || data.value?.result?.ressources?.title || 'Ressources',
    },
    {
      property: 'og:description',
      content: data.value?.result?.ressources?.ogDescription || data.value?.result?.ressources?.metaDescription || '',
    },
    {
      property: 'og:image',
      content: normalizeUrl(data.value?.result?.ressources?.ogImage?.url),
    },
    {
      property: 'og:image:width',
      content: '1200',
    },
    {
      property: 'og:image:height',
      content: '630',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:url',
      content: 'https://notrehistoria.ch/ressources',
    },
  ],
}))

// Transformer les ressources du CMS pour le composant ListeRessource (groupées par tag)
const formattedRessources = computed(() => {
  const ressources = data.value?.result?.ressources?.ressources
  if (!ressources) return []
  
  // Grouper par tag
  const grouped: Record<string, typeof ressources> = {}
  
  ressources.forEach((item) => {
    const tag = (Array.isArray(item.tag) ? item.tag[0] : item.tag) || 'Autre'
    if (!grouped[tag]) {
      grouped[tag] = []
    }
    grouped[tag].push(item)
  })
  
  // Convertir en format attendu par le composant
  return Object.entries(grouped).map(([tagName, items]) => ({
    name: tagName,
    items: items.map((item) => ({
      label: item.nom,
      link: item.fichier?.url || item.lien || '#',
      downloadText: item.fichier?.url ? 'Télécharger' : (item.lien ? 'Lien' : '')
    }))
  }))
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

const remerciementTitle = computed(() => {
  return data.value?.result?.ressources?.remerciement_title?.trim() || ''
})

const remerciementText = computed(() => {
  return data.value?.result?.ressources?.remerciement_text?.trim() || ''
})

const hasRemerciementSection = computed(() => {
  return Boolean(remerciementTitle.value || remerciementText.value)
})
</script>

<style lang="scss" scoped>
.ressources-remerciement_text {
  white-space: pre-line;
}
</style>
