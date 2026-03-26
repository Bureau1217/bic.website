<template>
  <div class="map-view">
    <div ref="mapContainer" class="map-view__container" :class="{ 'is-visible': isMapVisible }"></div>
    <Transition name="map-white-fade">
      <div v-if="!isMapVisible" class="map-view__reveal"></div>
    </Transition>

    <div v-if="isMapVisible && specialHiddenMarker" class="map-view__special-dot-wrapper">
      <span class="map-view__special-dot-label">Portugal</span>
      <button
        ref="specialDotButton"
        class="map-view__special-dot"
        type="button"
        aria-label="Afficher le lieu 12"
        @mouseenter="hoverSpecialHiddenMarker"
        @mouseleave="closePopupOnHoverOut"
        @click.stop="clickSpecialHiddenMarker"
      >
        <img
          src="/images/Map_notrehistoira_lisbon_2-01.png"
          alt=""
          class="map-view__special-dot-image"
          aria-hidden="true"
        />
        <img
          v-if="specialHiddenMarker.icon"
          :src="specialHiddenMarker.icon"
          :alt="specialHiddenMarker.title || ''"
          class="map-view__special-dot-icon"
          aria-hidden="true"
        />
        <span v-else class="map-view__special-dot-number">12</span>
      </button>
    </div>
    
    <!-- Conteneur des markers HTML -->
    <div ref="markersContainer" class="map-view__markers" :class="{ 'is-ready': isMapVisible }"></div>
    
    <!-- Message d'erreur si le style ne charge pas -->
    <div v-if="mapError" class="map-view__error">
      {{ mapError }}
    </div>
    
    <!-- Popup personnalisée -->
    <div
      v-if="activePopup"
      class="map-view__popup"
      :class="{ 'map-view__popup--below': popupBelow }"
      :style="{ left: popupPosition.x + 'px', top: popupPosition.y + 'px' }"
    >
      <!--<button class="map-view__popup-close" @click="closePopup">&times;</button>-->
      <NuxtLink :to="`/parcours/${activePopup.slug || activePopup.id}`" class="audio-card--map-popup-link">
        <AudioCard
          variant="map-popup"
          :track-audio-url="getAudioUrlForMarker(activePopup) || ''"
          :duration="audioDurations[activePopup.slug || activePopup.id]"
          :show-button="!!getAudioUrlForMarker(activePopup)"
          @play="playFromPopup(activePopup)"
        >
          <template #image>
            <img 
              v-if="activePopup.image"
              :src="activePopup.image" 
              loading="lazy" 
              :alt="activePopup.title || ''" 
              class="audio-card_image"
            />
            <div v-else class="audio-card_image-placeholder">
              <span>{{ activePopup.number || '?' }}</span>
            </div>
          </template>
          <template #info>
            <div class="audio-card_info_wrapper">
              <p class="audio-card_title" :class="{ 'audio-card_title--split': !!activePopup.number }">
                <span v-if="activePopup.number" class="audio-card_number">{{ activePopup.number }}.</span>
                <span class="audio-card_title_text">{{ activePopup.title }}</span>
              </p>
            </div>
            <p v-if="activePopup.adresse" class="audio-card_info_text">{{ activePopup.adresse }}</p>
          </template>
        </AudioCard>
      </NuxtLink>
    </div>
    
    <!-- Attribution SITG -->
    <div v-if="isMapVisible" class="map-view__attribution">
      Source : ICDG / SITG (État de Genève)
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import { loadArcGISModules } from '~/composables/useArcgisModules.client'

// Composables pour l'audio
const { getLieuBySlug } = usePodcastData()
const { playTrack } = useAudioPlayer()

// ============================================================================
// TYPES
// ============================================================================

export interface MapMarker {
  id: string | number
  coordinates: [number, number] // [lng, lat]
  title?: string
  description?: string
  adresse?: string            // Adresse postale du lieu
  icon?: string // URL ou emoji
  color?: string
  // Données pour le style AudioCardMap
  number?: string | number  // Numéro du lieu
  image?: string            // Image du podcast
  duration?: string         // Durée audio (ex: "12min")
  slug?: string             // Slug pour le lien
  data?: Record<string, unknown> // Données Kirby additionnelles
}

export interface Props {
  markers?: MapMarker[]
  center?: [number, number]
  zoom?: number
  darkMode?: boolean
  highlightedMarkerId?: string | number | null
}

// ============================================================================
// PROPS & EMITS
// ============================================================================

const props = withDefaults(defineProps<Props>(), {
  markers: () => [],
  center: () => [6.1432, 46.2044], // Genève
  zoom: 1,
  darkMode: true,
  highlightedMarkerId: null
})

const SPECIAL_HIDDEN_MARKER_NUMBER = 12

function extractMarkerNumber(marker: MapMarker | null | undefined): number | null {
  if (!marker) return null
  if (typeof marker.number === 'number' && Number.isFinite(marker.number)) return marker.number
  if (typeof marker.number === 'string') {
    const parsed = Number.parseFloat(marker.number)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function resolveSpecialHiddenMarker(markers: Array<MapMarker | null | undefined>): MapMarker | null {
  const validMarkers = markers.filter((marker): marker is MapMarker => {
    return !!marker && Array.isArray(marker.coordinates) && marker.coordinates.length === 2
  })

  const foundByNumber = validMarkers.find((marker) => {
    return extractMarkerNumber(marker) === SPECIAL_HIDDEN_MARKER_NUMBER
  })
  if (foundByNumber) return foundByNumber

  return validMarkers[SPECIAL_HIDDEN_MARKER_NUMBER - 1] || null
}

const specialHiddenMarker = computed(() => resolveSpecialHiddenMarker(props.markers))

function isSameMarker(a: MapMarker | null, b: MapMarker | null): boolean {
  if (!a || !b) return false
  return a.id === b.id
}

const emit = defineEmits<{
  markerClick: [marker: MapMarker]
  mapLoad: [view: unknown]
  requestClose: []
}>()

// ============================================================================
// CONFIGURATION ArcGIS SITG
// ============================================================================

// PortalItem ID pour le style "Tons sombres"
const SITG_PORTAL_ITEM_ID = '753d065ee1ba4d29be9a6de655abd94f'

// ============================================================================
// REFS & STATE
// ============================================================================

const mapContainer = ref<HTMLDivElement | null>(null)
const markersContainer = ref<HTMLDivElement | null>(null)
const specialDotButton = ref<HTMLButtonElement | null>(null)
const mapError = ref<string | null>(null)
const isMapReady = ref(false)
const isMapVisible = ref(false)

// Popup state
const activePopup = ref<MapMarker | null>(null)
const popupPosition = ref({ x: 0, y: 0 })
const popupBelow = ref(false) // true si le popup doit s'afficher en dessous
const selectedMarkerId = ref<string | number | null>(null)
const isPopupLocked = ref(false) // true si le popup a été ouvert par un clic (reste ouvert)

// Marker sur lequel on garde le centrage pendant le zoom
const zoomFocusMarker = ref<MapMarker | null>(null)

// --- Durées audio ---
const audioDurations = ref<Record<string, string>>({})

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}'${secs.toString().padStart(2, '0')}`
}

const loadAudioDuration = (slug: string, url: string) => {
  if (audioDurations.value[slug]) return
  const audio = new Audio()
  audio.preload = 'metadata'
  audio.addEventListener('loadedmetadata', () => {
    if (audio.duration && isFinite(audio.duration)) {
      audioDurations.value[slug] = formatDuration(audio.duration)
    }
  })
  audio.src = url
}

/**
 * Récupère l'URL audio d'un marker à partir des données podcast
 */
function getAudioUrlForMarker(marker: MapMarker): string | null {
  const slug = marker.slug || String(marker.id)
  const lieu = getLieuBySlug(slug)
  return lieu?.audio?.url || null
}

function ensureAudioDurationForMarker(marker: MapMarker) {
  const slug = marker.slug || String(marker.id)
  const audioUrl = getAudioUrlForMarker(marker)
  if (audioUrl) {
    loadAudioDuration(slug, audioUrl)
  }
}

/**
 * Lance la lecture audio depuis la popup
 */
function playFromPopup(marker: MapMarker) {
  const slug = marker.slug || String(marker.id)
  const lieu = getLieuBySlug(slug)
  if (lieu?.audio?.url) {
    playTrack({
      title: lieu.title,
      num: lieu.num,
      audioUrl: lieu.audio.url,
      slug: lieu.slug,
      type: 'lieu',
    })
  }
  closePopup()
  emit('requestClose')
}

let view: any | null = null
let esriMap: any | null = null

// Stockage des éléments DOM des markers
const markerElements = new Map<string | number, HTMLElement>()
// Stockage des données markers
const markerDataMap = new Map<string | number, MapMarker>()

// Handle pour l'animation frame
let updateMarkersRAF: number | null = null
let continuousUpdateRAF: number | null = null
let isContinuousUpdateRunning = false
let mapInitTimeoutId: number | null = null
let mapInitIdleId: number | null = null
let mapRevealTimeoutId: number | null = null
let hasMapInitStarted = false

type ArcGISModules = Awaited<ReturnType<typeof loadArcGISModules>>
let arcgisModules: ArcGISModules | null = null

// ============================================================================
// POPUP MANAGEMENT
// ============================================================================

// Dimensions approximatives du popup (AudioCard map-popup)
const POPUP_WIDTH = 280
const POPUP_HEIGHT = 120

function openPopup(marker: MapMarker, screenPoint: { x: number; y: number }, locked = false) {
  ensureAudioDurationForMarker(marker)

  const mapRect = mapContainer.value?.getBoundingClientRect()
  if (!mapRect) {
    popupPosition.value = { x: screenPoint.x, y: screenPoint.y - 10 }
    popupBelow.value = false
    activePopup.value = marker
    selectedMarkerId.value = marker.id
    isPopupLocked.value = locked
    updateSelectedMarkerStyles()
    return
  }

  // Calculer la position avec le transform CSS (-50%, -125%)
  let x = screenPoint.x
  let y = screenPoint.y - 10
  let showBelow = false

  // Vérifier les limites horizontales
  const halfPopupWidth = POPUP_WIDTH / 2
  const minX = halfPopupWidth + 10 // marge de 10px
  const maxX = mapRect.width - halfPopupWidth - 10

  if (x < minX) {
    x = minX
  } else if (x > maxX) {
    x = maxX
  }

  // Vérifier les limites verticales (le popup apparaît au-dessus avec -125%)
  const popupTopPosition = y - POPUP_HEIGHT * 1.25
  const minY = 10 // marge de 10px en haut

  if (popupTopPosition < minY) {
    // Si le popup sortirait en haut, le placer en dessous du marker
    y = screenPoint.y + 50 // décalage en dessous
    showBelow = true
  }

  popupPosition.value = { x, y }
  popupBelow.value = showBelow
  activePopup.value = marker
  selectedMarkerId.value = marker.id
  isPopupLocked.value = locked
  updateSelectedMarkerStyles()
}

function closePopup(force = false) {
  // Ne pas fermer si le popup est verrouillé (sauf si force=true)
  if (isPopupLocked.value && !force) return

  activePopup.value = null
  popupBelow.value = false
  selectedMarkerId.value = null
  isPopupLocked.value = false
  updateSelectedMarkerStyles()
}

function closePopupOnHoverOut() {
  // Fermer seulement si pas verrouillé
  if (!isPopupLocked.value) {
    closePopup(true)
  }
}

function getSpecialMarkerScreenPoint() {
  if (!specialHiddenMarker.value || !specialDotButton.value) return null

  const buttonRect = specialDotButton.value.getBoundingClientRect()
  const mapRect = mapContainer.value?.getBoundingClientRect()

  if (!mapRect) return null

  return {
    x: buttonRect.left - mapRect.left + buttonRect.width / 2 + 80, // Décalé vers la droite
    y: buttonRect.top - mapRect.top + 80 // Rapprocher du SVG central
  }
}

function hoverSpecialHiddenMarker() {
  if (!specialHiddenMarker.value) return

  const screenPoint = getSpecialMarkerScreenPoint()
  if (screenPoint) {
    openPopup(specialHiddenMarker.value, screenPoint, false)
  }
}

function clickSpecialHiddenMarker() {
  if (!specialHiddenMarker.value) return

  const screenPoint = getSpecialMarkerScreenPoint()
  if (screenPoint) {
    openPopup(specialHiddenMarker.value, screenPoint, true) // locked = true
  }

  emit('markerClick', specialHiddenMarker.value)
}

// ============================================================================
// HTML MARKERS MANAGEMENT
// ============================================================================

/**
 * Crée un élément DOM pour un marker
 */
function createMarkerElement(marker: MapMarker): HTMLElement {
  const el = document.createElement('div')
  el.className = 'map-view__marker'
  el.dataset.markerId = String(marker.id)

  // Contenu du marker : picto (icon) si disponible, sinon numéro
  if (marker.icon) {
    // Utiliser l'image picto du CMS
    el.innerHTML = `<img src="${marker.icon}" alt="${marker.title || ''}" class="map-view__marker-icon" />`
  } else {
    // Fallback : afficher le numéro
    const number = marker.number || ''
    el.innerHTML = `<span class="map-view__marker-number">${number}</span>`
  }

  // Helper pour obtenir la position écran du marker
  const getMarkerScreenPoint = () => {
    if (!view || !arcgisModules?.Point) return null
    const point = new arcgisModules.Point({
      longitude: marker.coordinates[0],
      latitude: marker.coordinates[1]
    })
    return view.toScreen(point)
  }

  // Gestionnaire de hover (mouseenter)
  el.addEventListener('mouseenter', () => {
    const screenPoint = getMarkerScreenPoint()
    if (screenPoint && markersContainer.value) {
      openPopup(marker, { x: screenPoint.x, y: screenPoint.y }, false)
    }
  })

  // Gestionnaire de hover out (mouseleave)
  el.addEventListener('mouseleave', () => {
    closePopupOnHoverOut()
  })

  // Gestionnaire de clic - verrouille le popup
  el.addEventListener('click', (e) => {
    e.stopPropagation()

    // Mémoriser ce marker pour garder le centrage pendant le zoom
    zoomFocusMarker.value = marker

    // Recentrer la carte sur le marker
    if (view) {
      if (!arcgisModules?.Point) return
      const point = new arcgisModules.Point({
        longitude: marker.coordinates[0],
        latitude: marker.coordinates[1]
      })
      // Démarrer la synchro frame-by-frame dès le clic
      // pour éviter un décalage au début de l'animation goTo.
      startContinuousMarkersUpdate()
      view.goTo({ target: point }, { duration: 500 }).then(() => {
        // Ouvrir la popup une fois le recentrage terminé (verrouillée)
        const screenPoint = view!.toScreen(point)
        if (screenPoint && markersContainer.value) {
          openPopup(marker, {
            x: screenPoint.x,
            y: screenPoint.y
          }, true) // locked = true
        }
      }).finally(() => {
        scheduleMarkersUpdate()
      })
    }

    emit('markerClick', marker)
  })

  return el
}

function updateSelectedMarkerStyles() {
  markerElements.forEach((el, id) => {
    const isSelected = selectedMarkerId.value !== null && id === selectedMarkerId.value
    el.classList.toggle('map-view__marker--selected', isSelected)
  })
}

function isHighlightedMarker(id: string | number, markerData: MapMarker): boolean {
  if (props.highlightedMarkerId === null || props.highlightedMarkerId === undefined) return false
  return id === props.highlightedMarkerId || markerData.slug === String(props.highlightedMarkerId)
}

/**
 * Met à jour la position de tous les markers HTML sur l'écran
 * Utilise requestAnimationFrame pour la performance
 */
function updateMarkersPosition() {
  if (!view || !markersContainer.value) return
  const PointCtor = arcgisModules?.Point
  if (!PointCtor) return
  
  markerElements.forEach((el, id) => {
    const markerData = markerDataMap.get(id)
    if (!markerData) return
    
    const point = new PointCtor({
      longitude: markerData.coordinates[0],
      latitude: markerData.coordinates[1]
    })
    
    const screenPoint = view!.toScreen(point)
    
    if (screenPoint) {
      // Utiliser transform pour de meilleures performances
      const isSelected = selectedMarkerId.value !== null && id === selectedMarkerId.value
      const isHighlighted = isHighlightedMarker(id, markerData)
      const shouldScaleIcon = isSelected || isHighlighted
      const markerIcon = el.querySelector('.map-view__marker-icon')
      if (markerIcon) {
        markerIcon.classList.toggle('map-view__marker-icon--scaled', shouldScaleIcon)
      }
      // Sur mobile, des coordonnées fractionnaires peuvent rendre les icônes floues/pixellisées.
      // On aligne la position sur des pixels entiers et on passe en translate3d.
      const pixelAlignedX = Math.round(screenPoint.x)
      const pixelAlignedY = Math.round(screenPoint.y)
      el.style.transform = `translate3d(${pixelAlignedX}px, ${pixelAlignedY}px, 0)`
      el.style.display = 'flex'
    } else {
      // Point hors de l'écran
      el.style.display = 'none'
    }
  })
}

/**
 * Planifie une mise à jour des markers avec requestAnimationFrame
 */
function scheduleMarkersUpdate() {
  if (updateMarkersRAF) {
    cancelAnimationFrame(updateMarkersRAF)
  }
  updateMarkersRAF = requestAnimationFrame(updateMarkersPosition)
}

/**
 * Met à jour les markers en continu pendant les animations de carte
 * pour garder les markers synchronisés avec le déplacement de la vue.
 */
function startContinuousMarkersUpdate() {
  if (isContinuousUpdateRunning) return
  isContinuousUpdateRunning = true

  const tick = () => {
    if (!isContinuousUpdateRunning) return
    updateMarkersPosition()
    continuousUpdateRAF = requestAnimationFrame(tick)
  }

  tick()
}

function stopContinuousMarkersUpdate() {
  isContinuousUpdateRunning = false
  if (continuousUpdateRAF) {
    cancelAnimationFrame(continuousUpdateRAF)
    continuousUpdateRAF = null
  }
}

/**
 * Ajoute les markers HTML sur la carte
 */
function addMarkers() {
  if (!view || !markersContainer.value) return
  
  // Supprimer les markers existants
  clearMarkers()
  
  // Ajouter les nouveaux markers
  props.markers.forEach((markerData) => {
    if (!markerData) return
    if (isSameMarker(markerData, specialHiddenMarker.value)) return

    const el = createMarkerElement(markerData)
    
    // Stocker les données et l'élément
    markerDataMap.set(markerData.id, markerData)
    markerElements.set(markerData.id, el)
    
    // Ajouter au DOM
    markersContainer.value!.appendChild(el)
  })
  
  // Mettre à jour les positions
  updateMarkersPosition()
  updateSelectedMarkerStyles()
}

/**
 * Supprime tous les markers de la carte
 */
function clearMarkers() {
  // Supprimer les éléments DOM
  markerElements.forEach((el) => {
    el.remove()
  })
  markerElements.clear()
  markerDataMap.clear()
}

// ============================================================================
// MAP INITIALIZATION
// ============================================================================

async function initMap() {
  if (!mapContainer.value) return
  if (hasMapInitStarted) return
  hasMapInitStarted = true
  
  try {
    isMapReady.value = false
    isMapVisible.value = false
    const arcgis = await loadArcGISModules()
    arcgisModules = arcgis
    mapError.value = null
    
    // Créer le VectorTileLayer avec le style SITG "Tons sombres"
    const sitgLayer = new arcgis.VectorTileLayer({
      portalItem: {
        id: SITG_PORTAL_ITEM_ID,
        portal: {
          url: arcgis.esriConfig.portalUrl
        }
      }
    })
    
    // Créer la Map avec le VectorTileLayer comme basemap
    esriMap = new arcgis.EsriMap({
      basemap: {
        baseLayers: [sitgLayer]
      }
    })
    
    // Créer la vue
    view = new arcgis.MapView({
      container: mapContainer.value,
      map: esriMap,
      center: props.center,
      zoom: props.zoom,
      ui: {
        components: ['zoom'] // Garder uniquement le contrôle de zoom
      },
      constraints: {
        rotationEnabled: false,
        snapToZoom: false,
        minZoom: 4,
        maxZoom: 10,
        geometry: new arcgis.Extent({
          // Limites de navigation élargies pour inclure tous les lieux (WGS84)
          xmin: 6.05,  // ouest
          ymin: 46.15, // sud
          xmax: 6.25,  // est
          ymax: 46.28, // nord
          spatialReference: { wkid: 4326 }
        })
      }
    })
    
    // Positionner le zoom en bas à droite
    view.ui.move('zoom', 'bottom-right')

    // Sur mobile, coller les boutons zoom contre le bord droit
    if (window.matchMedia('(max-width: 479px)').matches) {
      view.ui.padding = { top: 0, right: 0, bottom: 0, left: 0 }
    }
    
    // Attendre que la vue soit prête
    await view.when()
    
    // Désactiver le zoom par scroll (molette/trackpad)
    // pour que le scroll continue de faire défiler la page
    // Le double-clic reste actif pour zoomer
    view.on('mouse-wheel', (event: any) => {
      event.stopPropagation()
    })

    // Sur appareils tactiles (iPad/smartphone), garder le scroll page à 1 doigt.
    // La navigation de la carte reste possible avec des gestes à 2 doigts.
    if (window.matchMedia('(pointer: coarse)').matches) {
      view.navigation.browserTouchPanEnabled = false
    }
    
    // Ajouter les markers HTML initiaux
    addMarkers()
    
    // Mettre à jour les positions des markers quand la carte bouge
    view.watch('extent', () => {
      scheduleMarkersUpdate()
    })
    
    // Pendant les animations/interactions, forcer une synchro frame par frame
    view.watch('stationary', (isStationary: boolean) => {
      if (isStationary) {
        stopContinuousMarkersUpdate()
        scheduleMarkersUpdate()
      } else {
        startContinuousMarkersUpdate()
      }
    })
    
    // Fermer la popup quand on clique sur la carte (pas sur un marker)
    view.on('click', () => {
      closePopup(true) // force close
    })

    // Fermer la popup quand on drag la carte
    view.on('drag', () => {
      closePopup(true) // force close
      // Annuler le focus de zoom quand l'utilisateur déplace manuellement la carte
      zoomFocusMarker.value = null
    })

    // Recentrer sur le marker sélectionné quand on zoom
    view.watch('zoom', () => {
      if (zoomFocusMarker.value && arcgisModules?.Point) {
        const point = new arcgisModules.Point({
          longitude: zoomFocusMarker.value.coordinates[0],
          latitude: zoomFocusMarker.value.coordinates[1]
        })
        view!.center = point
      }
    })

    // Émettre l'événement de chargement
    emit('mapLoad', view)
    requestAnimationFrame(() => {
      isMapReady.value = true
      if (mapRevealTimeoutId) {
        window.clearTimeout(mapRevealTimeoutId)
      }
      // Petit délai pour laisser les dernières couches se stabiliser avant le fondu.
      mapRevealTimeoutId = window.setTimeout(() => {
        isMapVisible.value = true
        mapRevealTimeoutId = null
      }, 320)

      // Agrandir les icônes + et - dans les boutons zoom
      setTimeout(() => {
        const zoomButtons = mapContainer.value?.querySelectorAll('.esri-zoom calcite-button')
        zoomButtons?.forEach((btn: Element) => {
          const shadowRoot = (btn as HTMLElement).shadowRoot
          if (shadowRoot) {
            // Injecter un style dans le shadow DOM du bouton
            const style = document.createElement('style')
            style.textContent = `
              calcite-icon {
                width: 32px !important;
                height: 32px !important;
                min-width: 32px !important;
                min-height: 32px !important;
              }
              /* Enlever le hover gris */
              :host(:hover),
              :host(:focus),
              :host(:active),
              button:hover,
              button:focus,
              button:active,
              .button:hover,
              .button:focus,
              .button:active {
                background: var(--red, #e63946) !important;
                background-color: var(--red, #e63946) !important;
                outline: none !important;
                box-shadow: none !important;
              }
            `
            shadowRoot.appendChild(style)

            const icon = shadowRoot.querySelector('calcite-icon')
            if (icon) {
              (icon as HTMLElement).style.width = '32px';
              (icon as HTMLElement).style.height = '32px';
              const iconShadow = (icon as HTMLElement).shadowRoot
              if (iconShadow) {
                // Injecter un style dans le shadow DOM de l'icône
                const iconStyle = document.createElement('style')
                iconStyle.textContent = `
                  svg {
                    width: 32px !important;
                    height: 32px !important;
                  }
                `
                iconShadow.appendChild(iconStyle)
              }
            }
          }
        })
      }, 800)
    })
    
    console.log('[MapView] ArcGIS map initialized with SITG style "Tons sombres" and HTML markers')
    
  } catch (error: unknown) {
    hasMapInitStarted = false
    isMapReady.value = true
    isMapVisible.value = true
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[MapView] Failed to initialize map:', errorMessage)
    
    // Afficher une erreur claire si le style n'est pas accessible
    if (errorMessage.includes('403') || errorMessage.includes('401') || errorMessage.includes('authentication')) {
      mapError.value = 'Map style inaccessible (authentification requise)'
    } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      mapError.value = 'Map style introuvable'
    } else {
      mapError.value = `Map style inaccessible: ${errorMessage}`
    }
  }
}

function handleWindowResize() {
  closePopup()
}

function isMobilePhoneViewport() {
  return window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(max-width: 768px)').matches
}

function handleTouchMoveOnMap(event: TouchEvent) {
  if (!isMobilePhoneViewport()) return
  if (event.touches.length >= 2) {
    closePopup()
  }
}

function scheduleMapInit() {
  const start = () => {
    if (!view) {
      void initMap()
    }
  }

  const browserWindow = window as Window & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
    cancelIdleCallback?: (handle: number) => void
  }

  if (typeof browserWindow.requestIdleCallback === 'function') {
    mapInitIdleId = browserWindow.requestIdleCallback(() => start(), { timeout: 1200 })
    return
  }

  mapInitTimeoutId = window.setTimeout(start, 250)
}

// ============================================================================
// LIFECYCLE & WATCHERS
// ============================================================================

onMounted(async () => {
  await nextTick()
  console.log('[MapView] Container:', mapContainer.value)
  window.addEventListener('resize', handleWindowResize)
  mapContainer.value?.addEventListener('touchmove', handleTouchMoveOnMap, { passive: true })
  scheduleMapInit()
})

onBeforeUnmount(() => {
  // Annuler l'animation frame en cours
  if (updateMarkersRAF) {
    cancelAnimationFrame(updateMarkersRAF)
    updateMarkersRAF = null
  }
  stopContinuousMarkersUpdate()
  
  window.removeEventListener('resize', handleWindowResize)
  mapContainer.value?.removeEventListener('touchmove', handleTouchMoveOnMap)
  if (mapInitTimeoutId) {
    window.clearTimeout(mapInitTimeoutId)
    mapInitTimeoutId = null
  }
  if (mapInitIdleId) {
    const browserWindow = window as Window & { cancelIdleCallback?: (handle: number) => void }
    browserWindow.cancelIdleCallback?.(mapInitIdleId)
    mapInitIdleId = null
  }
  if (mapRevealTimeoutId) {
    window.clearTimeout(mapRevealTimeoutId)
    mapRevealTimeoutId = null
  }

  clearMarkers()
  
  if (view) {
    view.destroy()
    view = null
  }
  
  esriMap = null
})

// Réagir aux changements de markers
watch(() => props.markers, () => {
  if (view && !view.updating) {
    addMarkers()
  }
}, { deep: true })

// Réagir aux changements de center/zoom
watch([() => props.center, () => props.zoom], ([newCenter, newZoom]) => {
  if (view) {
    view.goTo({
      center: newCenter,
      zoom: newZoom
    }, {
      duration: 1000
    })
  }
})

watch(() => props.highlightedMarkerId, () => {
  scheduleMarkersUpdate()
})

// ============================================================================
// EXPOSE
// ============================================================================

defineExpose({
  /**
   * Retourne la MapView ArcGIS (équivalent de getMap() avec MapLibre)
   * Note: le type a changé de maplibregl.Map à MapView
   */
  getMap: () => view,
  
  /**
   * Anime la vue vers un point
   */
  flyTo: (center: [number, number], zoom?: number) => {
    view?.goTo({
      center: center,
      zoom: zoom || props.zoom
    }, {
      duration: 1000
    })
  },
  
  /**
   * Ajuste la vue pour afficher des bounds
   */
  fitBounds: (bounds: [[number, number], [number, number]], padding = 50) => {
    if (!view || !arcgisModules?.Extent) return
    
    const extent = new arcgisModules.Extent({
      xmin: bounds[0][0],
      ymin: bounds[0][1],
      xmax: bounds[1][0],
      ymax: bounds[1][1],
      spatialReference: { wkid: 4326 }
    })
    
    view.goTo(extent.expand(1.2), {
      duration: 1000
    }).then(() => {
      // Appliquer le padding en ajustant légèrement
      if (view) {
        view.padding = {
          top: padding,
          right: padding,
          bottom: padding,
          left: padding
        }
      }
    })
  }
})
</script>

<style>
/* ============================================================================
   MAP WRAPPER
   ============================================================================ */

.map-wrapper.map-view {
  width: 100%;
  height: 100vh;
}

@media screen and (max-width: 991px) {
  .map-wrapper.map-view {
    height: 70vh;
    
  }
}

/* ============================================================================
   MAP CONTAINER
   ============================================================================ */

.map-view {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-view__container {
  width: 100%;
  height: 100%;
  opacity: 1;
}

.map-view__container.is-visible {
  opacity: 1;
}

.map-view__reveal {
  position: absolute;
  inset: 0;
  background: var(--white);
  z-index: 120;
  pointer-events: none;
}

.map-view__special-dot-wrapper {
  position: absolute;
  bottom: 30px;
  left: 16px;
  z-index: 300;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.map-view__special-dot-label {
  color: var(--red);
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.map-view__special-dot {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 1px solid var(--red);
  background: transparent;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-view__special-dot-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-view__special-dot-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.map-view__special-dot-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: bold;
  color: var(--black);
  pointer-events: none;
}

.map-white-fade-leave-active {
  transition: opacity 0.75s ease;
}

.map-white-fade-leave-to {
  opacity: 0;
}

/* ============================================================================
   ERROR STATE
   ============================================================================ */

.map-view__error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #ff6b6b;
  padding: 20px 30px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  z-index: 100;
  max-width: 80%;
}

/* ============================================================================
   HTML MARKERS
   ============================================================================ */

.map-view__markers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.map-view__markers.is-ready {
  opacity: 1;
}

.map-view__marker {
  position: absolute;
  top: 0;
  left: 0;
  /* Centrer le marker sur son point */
  margin-left: -20px;
  margin-top: -40px;
  /* Style du marker : jaune avec border-radius spécifique */
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  /* Pas de transition sur transform: évite l'effet de "retard" pendant les déplacements */
  transition: filter 0.2s ease-in-out;
  will-change: transform;
}

.map-view__marker-number {
  font-size: 16px;
  font-weight: bold;
  color: #000;
  line-height: 1;
}

.map-view__marker-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
  image-rendering: auto;
  transition: transform 0.2s ease;
}

.map-view__marker-icon:hover {
  transform: scale(1.15);
}

.map-view__marker-icon--scaled {
  transform: scale(1.15);
}

.map-view__marker--selected .map-view__marker-icon {
  color: var(--green);
}

.map-view__marker--selected .map-view__marker-number {
  color: var(--green);
}

/* ============================================================================
   CUSTOM POPUP
   ============================================================================ */

.map-view__popup {
  position: absolute;
  transform: translate(-50%, -125%);
  z-index: 400;
  pointer-events: auto;
  animation: popup-fade-in 0.2s ease-out;
}

@keyframes popup-fade-in {
  from {
    opacity: 0;
    transform: translate(-50%, -125%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -125%);
  }
}

.map-view__popup--below {
  transform: translate(-50%, 0);
  animation: popup-fade-in-below 0.2s ease-out;
}

@keyframes popup-fade-in-below {
  from {
    opacity: 0;
    transform: translate(-50%, 0);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.map-view__popup-close {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-view__popup-close:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* ============================================================================
   ATTRIBUTION
   ============================================================================ */

.map-view__attribution {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 3px;
  pointer-events: none;
  z-index: 10;
}

/* ============================================================================
   ARCGIS UI CUSTOMIZATION
   ============================================================================ */

/* Masquer l'attribution ArcGIS par défaut (on utilise la nôtre) */
.map-view .esri-attribution {
  display: none;
}

/* Style des contrôles de zoom */
.map-view .esri-ui-top-right {
  top: 10px;
  right: 10px;
  color:white;
}



/* Conteneur des boutons zoom - au-dessus des markers */
.map-view .esri-zoom {
  background: transparent !important;
  box-shadow: none !important;
  position: relative !important;
  z-index: 100 !important;
}

.map-view .esri-ui {
  z-index: 100 !important;
}

.map-view .esri-ui-corner {
  z-index: 100 !important;
}

.map-view .esri-ui-bottom-right {
  z-index: 100 !important;
}

.map-view .esri-component {
  z-index: 100 !important;
}

/* Override des variables Calcite pour les boutons */
.map-view .esri-widget--button,
.map-view .esri-widget--button:is(calcite-button) {
  --calcite-icon-color: white !important;
  --calcite-color-text-3: white !important;
  --calcite-color-foreground-1: var(--red) !important;
  --calcite-color-foreground-2: var(--red) !important;
  --calcite-color-foreground-3: var(--red) !important;
  width: 60px;
  height: 60px;
  color: white !important;
  background: var(--red) !important;
  border: none !important;
}

/* Agrandir les icônes + et - sans changer la taille du bloc */
.map-view .esri-zoom calcite-icon {
  transform: scale(1.8);
}

/* Bouton interne doit faire 60px aussi */
.map-view .esri-widget--button calcite-button,
.map-view .esri-widget--button button {
  width: 60px !important;
  height: 60px !important;
  padding: 0 !important;
}

@media screen and (max-width: 479px) {
  .map-view .esri-widget--button,
  .map-view .esri-widget--button:is(calcite-button) {
    width: 60px;
    height: 60px;
    margin: 0 !important;
    border-radius: 0 !important;
  }

  .map-view .esri-ui-corner.esri-ui-bottom-right {
    right: 0 !important;
    bottom: 42px !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .map-view .esri-ui-bottom-right .esri-component,
  .map-view .esri-ui-bottom-right .esri-zoom {
    padding: 0 !important;
    margin: 0 !important;
  }

  .map-view .esri-zoom {
    border-radius: 0 !important;
  }
}

/* Enlever l'effet hover sur les boutons zoom */
.map-view .esri-widget--button:hover,
.map-view .esri-widget--button:focus,
.map-view .esri-widget--button:active,
.map-view .esri-widget--button:is(calcite-button):hover,
.map-view .esri-widget--button:is(calcite-button):focus,
.map-view .esri-widget--button:is(calcite-button):not(:hover) {
  --calcite-icon-color: white !important;
  --calcite-color-text-3: white !important;
  --calcite-color-foreground-1: var(--red) !important;
  --calcite-color-foreground-2: var(--red) !important;
  --calcite-color-foreground-3: var(--red) !important;
  background: var(--red) !important;
  color: white !important;
  cursor: pointer;
  box-shadow: none !important;
}

/* Icônes + et - en blanc */
.map-view .esri-icon-plus,
.map-view .esri-icon-minus,
.map-view calcite-icon {
  color: white !important;
  --calcite-icon-color: white !important;
}

/* Enlever tout effet de fond gris sur le conteneur */
.map-view .esri-ui-corner,
.map-view .esri-component {
  background: transparent !important;
}

/* Force le style sur tous les états Calcite */
.map-view calcite-button,
.map-view calcite-button:hover,
.map-view calcite-button:focus,
.map-view calcite-button:active {
  --calcite-color-brand: var(--red) !important;
  --calcite-color-brand-hover: var(--red) !important;
  --calcite-color-brand-press: var(--red) !important;
  --calcite-icon-color: white !important;
  background: var(--red) !important;
}



/* ============================================================================
   POPUPS - Style AudioCardMap
   ============================================================================ */

/* Container popup ArcGIS */
.map-view .esri-popup__main-container {
  max-width: none !important;
  width: auto !important;
}

.map-view .esri-popup__content {
  padding: 0 !important;
  margin: 0 !important;
}

.map-view .esri-popup__header,
.map-view .esri-popup__footer {
  display: none !important;
}

/* Lien wrapper pour la popup AudioCard */
.audio-card--map-popup-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

/* Map popup variant : styles spécifiques gérés dans _audio.scss */
</style>
