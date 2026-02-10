/**
 * Composable pour accéder aux données globales du podcast (lieux et épisodes)
 * Ces données sont fetchées une seule fois et partagées entre tous les composants
 */

// Types pour les portraits (structure dans chaque lieu)
export type PortraitData = {
  nom: string | null
  description: string | null
  image: CMS_API_File | null
  link: { slug: string } | null
}

// Types pour les lieux
export type LieuData = {
  title: string
  slug: string
  gps: string | null  // Format: "46.5191, 6.5668" (lat, lng)
  picto: CMS_API_File | null
  imagepodcast: CMS_API_File | null
  audio: CMS_API_File | null
  num: string | number | null
  portraitlayout: PortraitData[] | null
}

// Types pour les épisodes
export type EpisodeData = {
  title: string
  slug: string
  num: string | number | null
  texte: string | null
  imagepodcast: CMS_API_File | null
  audio: CMS_API_File | null
}

// Type pour la réponse de l'API
type PodcastDataResponse = CMS_API_Response & {
  result: {
    lieux: LieuData[]
    episodes: EpisodeData[]
  }
}

export function usePodcastData() {
  // State partagé entre tous les composants (SSR-friendly)
  const lieux = useState<LieuData[]>('podcast-lieux', () => [])
  const episodes = useState<EpisodeData[]>('podcast-episodes', () => [])
  const isLoaded = useState<boolean>('podcast-data-loaded', () => false)
  const error = useState<Error | null>('podcast-data-error', () => null)

  // Fonction pour fetcher les données (appelée une seule fois)
  const fetchPodcastData = async () => {
    // Si les données sont déjà chargées, ne pas refetcher
    if (isLoaded.value && lieux.value.length > 0) {
      return
    }

    try {
      const { data } = await useFetch<PodcastDataResponse>('/api/CMS_KQLRequest', {
        key: 'podcast-global-data',
        method: 'POST',
        body: {
          query: 'site',
          select: {
            // Récupérer les lieux avec toutes leurs données
            lieux: {
              query: "site.find('parcours').children().template('lieu').listed()",
              select: {
                title: true,
                slug: true,
                num: 'page.num',
                gps: 'page.gps.value',
                picto: {
                  query: 'page.picto.toFile',
                  select: {
                    url: true,
                    alt: true,
                  },
                },
                imagepodcast: {
                  query: 'page.imagepodcast.toFile',
                  select: {
                    url: true,
                    alt: true,
                    width: true,
                    height: true,
                  },
                },
                audio: {
                  query: 'page.files.template("audio").first',
                  select: {
                    url: true,
                    filename: true,
                  },
                },
                portraitlayout: {
                  query: 'page.portraitlayout.toStructure',
                  select: {
                    nom: 'structureItem.nom.value',
                    description: 'structureItem.description.value',
                    image: {
                      query: 'structureItem.image.toFile',
                      select: {
                        url: true,
                        alt: true,
                        width: true,
                        height: true,
                      },
                    },
                    link: {
                      query: 'structureItem.link.toPages.first',
                      select: {
                        slug: true,
                      },
                    },
                  },
                },
              },
            },
            // Récupérer les épisodes
            episodes: {
              query: "site.find('parcours').children().template('episode').listed()",
              select: {
                title: true,
                slug: true,
                num: 'page.num',
                texte: 'page.texte.value',
                imagepodcast: {
                  query: 'page.images.template("poster").first',
                  select: {
                    url: true,
                    alt: true,
                    width: true,
                    height: true,
                  },
                },
                audio: {
                  query: 'page.files.template("audio").first',
                  select: {
                    url: true,
                    filename: true,
                  },
                },
              },
            },
          },
        },
      })

      if (data.value?.result) {
        lieux.value = data.value.result.lieux || []
        episodes.value = data.value.result.episodes || []
        isLoaded.value = true
      }
    } catch (e) {
      error.value = e as Error
      console.error('[usePodcastData] Erreur lors du fetch:', e)
    }
  }

  // Computed pour le premier épisode (utile pour AudioPlayer)
  const firstEpisode = computed(() => episodes.value[0] || null)

  // Computed pour le premier lieu
  const firstLieu = computed(() => lieux.value[0] || null)

  // Computed: tous les portraits de tous les lieux (mélangés aléatoirement)
  const allPortraits = computed(() => {
    const portraits: PortraitData[] = []
    for (const lieu of lieux.value) {
      if (lieu.portraitlayout?.length) {
        for (const p of lieu.portraitlayout) {
          // Ne garder que les portraits ayant au moins une image
          if (p.image?.url) {
            portraits.push(p)
          }
        }
      }
    }
    // Mélanger aléatoirement (Fisher-Yates shuffle)
    for (let i = portraits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [portraits[i], portraits[j]] = [portraits[j], portraits[i]]
    }
    return portraits
  })

  // Fonction utilitaire pour parser les coordonnées GPS
  const parseGpsCoordinates = (gps: string | null): { lat: number; lng: number } | null => {
    if (!gps) return null
    
    const parts = gps.split(',').map(p => parseFloat(p.trim()))
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null
    
    return { lat: parts[0], lng: parts[1] }
  }

  // Fonction pour trouver un lieu par son slug
  const getLieuBySlug = (slug: string) => {
    return lieux.value.find(l => l.slug === slug) || null
  }

  // Fonction pour trouver un épisode par son slug
  const getEpisodeBySlug = (slug: string) => {
    return episodes.value.find(e => e.slug === slug) || null
  }

  return {
    // Données
    lieux,
    episodes,
    isLoaded,
    error,
    
    // Méthodes
    fetchPodcastData,
    
    // Computed helpers
    firstEpisode,
    firstLieu,
    allPortraits,
    
    // Utilitaires
    parseGpsCoordinates,
    getLieuBySlug,
    getEpisodeBySlug,
  }
}
