<template>
  <main class="v-parcours-slug">

    <!-- Picto numéro du lieu (depuis le CMS) -->
    <img 
      v-if="data?.result?.picto?.url" 
      :src="data?.result?.picto?.url" 
      loading="lazy" 
      :alt="`Lieu n°${data?.result?.title}`" 
      class="number"
    >

    <!-- Image de fond / cover (depuis le CMS) -->
    <img 
      v-if="data?.result?.cover?.url" 
      :src="data.result.cover.url" 
      loading="lazy" 
      :alt="data.result.cover.alt || data.result.title" 
      class="background"
    >

    <!-- AudioCard -->
    <AudioCard 
      v-if="data?.result?.imagepodcast?.url"
      :title="data?.result?.title ?? ''" 
      :image="data.result.imagepodcast.url" 
      :alt="data.result.imagepodcast.alt ?? ''"
      style="background-color: #017f3f;"
      @play="onPlayAudio"
    />


    <!-- Layout: chaque row = une section .block-text -->
    <ContentBlockText
      v-for="(row, rowIndex) in layoutRows"
      :key="row.id ?? rowIndex"
      :blocks="getBlocksForRow(row)"
      :is-auto="rowIndex % 2 === 1"
    />

    <!-- Popup QR code : propose de lancer l'audio si ?qr=1 -->
    <QrAudioPopup
      v-if="data?.result?.audio?.url"
      v-model="showQrPopup"
      :title="data?.result?.title ?? ''"
      :image="data?.result?.imagepodcast?.url ?? ''"
      @play="onPlayAudio"
    />

  </main>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

// Lecteur audio global (même player que le menu)
const { playTrack } = useAudioPlayer()

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

/** Bloc avec contenu résolu (images avec URLs) */
type ResolvedBlock = {
  id: string
  type: string
  isHidden?: boolean
  content: {
    text?: string
    level?: string
    image?: { url: string; alt?: string; width?: number; height?: number } | null
    images?: { url: string; alt?: string; width?: number; height?: number }[]
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
    cover?: CMS_API_File | null
    picto?: CMS_API_File | null
    imagepodcast?: CMS_API_File | null
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
      // Utilise la méthode PHP personnalisée qui résout les fichiers
      layout: 'page.layoutWithResolvedFiles',
      cover: {
        query: 'page.cover.toFile',
        select: { url: true, alt: true },
      },
      picto: {
        query: 'page.picto.toFile',
        select: { url: true, alt: true },
      },
      imagepodcast: {
        query: 'page.imagepodcast.toFile',
        select: { url: true, alt: true },
      },
      audio: {
        query: 'page.content.audio.toFile',
        select: { url: true, filename: true },
      },
    },
  },
})

console.log('data imagepodcast', data.value?.result?.imagepodcast?.url)


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
