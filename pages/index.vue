<template>
  <main class="v-home">
    <Menu />

    <template v-if="data?.result">
      <HomeHero
        :titre="data.result.home.titre"
        :soustitre="data.result.home.soustitre"
        :cover="data.result.home.cover"
        :audio-card="{
          title: 'Episode 1',
          description: 'Lorem ipsum dolor sit amet.',
          duration: '12min',
          image: data.result.home.podcastImage
        }"
      />

      <!-- Carte interactive SITG avec lieux Kirby -->
      <div style="height: 100vh; width: 100%;">
        <MapView
          :center="[6.1432, 46.2044]"
          :zoom="5"
          :markers="mapMarkers"
        />
      </div>
    </template>

    <PortraitSlider />

   
    <ListeAgenda />

    <AppFooter />

  </main>
</template>



<script setup lang="ts">
// Types pour les lieux avec coordonnées GPS
type LieuData = {
  title: string
  slug: string
  gps: string | null  // Format: "46.5191, 6.5668" (lat, lng)
  picto: CMS_API_File | null
  imagepodcast: CMS_API_File | null  // Image pour la popup
  num: string | number | null        // Numéro du lieu (ordre de tri)
}

type FetchData = CMS_API_Response & {
  result: {
    home: {
      title: string
      slug: string
      titre: CMS_API_Block[]
      soustitre: CMS_API_Block[]
      cover: CMS_API_File | null
    }
    nav: CMS_API_PageItem[]
    lieux: LieuData[]
  }
}

const { data } = await useFetch<FetchData>('/api/CMS_KQLRequest', {
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
          cover: {
            query: 'page.cover.toFile',
            select: {
              url: true,
              alt: true,
              width: true,
              height: true,
            },
          },
        },
      },
      nav: {
        query: 'site.children().listed()',
        select: {
          title: true,
          slug: true,
        },
      },
      // Récupérer les lieux avec coordonnées GPS et données pour AudioCardMap
      lieux: {
        query: "site.find('parcours').children().listed()",
        select: {
          title: true,
          slug: true,
          num: 'page.num',  // Numéro de tri Kirby
          // Champ GPS - format texte "lat, lng"
          gps: 'page.gps.value',
          picto: {
            query: 'page.picto.toFile',
            select: {
              url: true,
              alt: true,
            },
          },
          // Image pour la popup AudioCardMap
          imagepodcast: {
            query: 'page.imagepodcast.toFile',
            select: {
              url: true,
              alt: true,
            },
          },
        },
      },
    },
  },
})

console.log("hello")
console.log(data.value?.result?.lieux?.map(l => ({
  slug: l.slug,
  picto: l.picto?.url,
  imagepodcast: l.imagepodcast?.url,
})))







/**
 * Parse les coordonnées GPS depuis le format texte "lat, lng"
 * Exemple: "46.5191, 6.5668" → { lat: 46.5191, lng: 6.5668 }
 */
function parseGpsCoordinates(gps: string | null): { lat: number; lng: number } | null {
  if (!gps) return null
  
  const parts = gps.split(',').map(p => parseFloat(p.trim()))
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null
  
  return { lat: parts[0], lng: parts[1] }
}

// Transformer les lieux Kirby en markers pour MapView avec style AudioCardMap
const mapMarkers = computed(() => {
  console.log('[Index] Lieux from Kirby:', data.value?.result?.lieux)
  
  if (!data.value?.result?.lieux) return []
  
  return data.value.result.lieux
    .map((lieu, index) => {
      const coords = parseGpsCoordinates(lieu.gps)
      if (!coords) return null
      
      return {
        id: lieu.slug || index,
        coordinates: [coords.lng, coords.lat] as [number, number], // MapLibre: [lng, lat]
        title: lieu.title,
        slug: lieu.slug,
        // Données pour le style AudioCardMap
        number: lieu.num || (index + 1),
        image: lieu.imagepodcast?.url,  // Image podcast (ou picto en fallback)
        icon: lieu.picto?.url,          // Picto pour le marker sur la carte
        // duration: '12min', // À récupérer depuis Kirby si disponible
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

