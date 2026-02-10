<template>
  <main class="v-parcours">
  
    <section class="page_header">
      <AppBlocks :blocks="data?.result?.parcours?.titre" />
      <AppBlocks :blocks="data?.result?.parcours?.soustitre" />
    </section>

    <!-- Carte interactive SITG avec lieux Kirby -->
    <div style="height: 100vh; width: 100%;">
      <MapView
        :center="[6.1432, 46.2044]"
        :zoom="5"
        :markers="mapMarkers"
      />
    </div>

  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// FETCH DONNEES PODCAST (lieux pour la carte)
const { lieux, parseGpsCoordinates } = usePodcastData()

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
    },
  },
})

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
        image: lieu.imagepodcast?.url,
        icon: lieu.picto?.url,
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
    }>
})
</script>
