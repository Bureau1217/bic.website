<template>
  <div class="map-view">
    <div ref="mapContainer" class="map-view__container"></div>
    
    <!-- Conteneur des markers HTML -->
    <div ref="markersContainer" class="map-view__markers"></div>
    
    <!-- Message d'erreur si le style ne charge pas -->
    <div v-if="mapError" class="map-view__error">
      {{ mapError }}
    </div>
    
    <!-- Popup personnalisée -->
    <div 
      v-if="activePopup" 
      class="map-view__popup"
      :style="{ left: popupPosition.x + 'px', top: popupPosition.y + 'px' }"
    >
      <!--<button class="map-view__popup-close" @click="closePopup">&times;</button>-->
      <NuxtLink :to="`/parcours/${activePopup.slug || activePopup.id}`" class="map-card map-card--popup">
        <div class="map-card_image_wrapper" :class="{ 'no-image': !activePopup.image }">
          <img 
            v-if="activePopup.image"
            :src="activePopup.image" 
            loading="lazy" 
            :alt="activePopup.title || ''" 
            class="audio-card_image"
          >
          <div v-else class="audio-card_image-placeholder">
            <span>{{ activePopup.number || '?' }}</span>
          </div>
          <div 
            class="audio-card_button" 
            v-if="getAudioUrlForMarker(activePopup)"
            @click.prevent.stop="playFromPopup(activePopup)"
          >
            <img class="image" src="/images/Picto-Podcast-jaune.svg" loading="lazy" alt="">
            <p class="audio-card_duration" v-if="audioDurations[activePopup.slug || activePopup.id]">
              {{ audioDurations[activePopup.slug || activePopup.id] }}
            </p>
          </div>
        </div>
        <div class="map-card_info">
          <div class="audio-card_info_wrapper">
            <div v-if="activePopup.number" class="audio-card_number">{{ activePopup.number }}.</div>
            <p class="audio-card_title">{{ activePopup.title }}</p>
          </div>
          <p v-if="activePopup.description" class="audio-card_info_text">{{ activePopup.description }}</p>
        </div>
      </NuxtLink>
    </div>
    
    <!-- Attribution SITG -->
    <div class="map-view__attribution">
      Source : ICDG / SITG (État de Genève)
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

// ArcGIS CSS (chargé côté client uniquement)
import '@arcgis/core/assets/esri/themes/dark/main.css'

// ArcGIS imports
import esriConfig from '@arcgis/core/config'
import EsriMap from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer'
import Point from '@arcgis/core/geometry/Point'
import Extent from '@arcgis/core/geometry/Extent'

// Composables pour l'audio
const { lieux, isLoaded, getLieuBySlug } = usePodcastData()
const { playTrack } = useAudioPlayer()

// ============================================================================
// TYPES
// ============================================================================

export interface MapMarker {
  id: string | number
  coordinates: [number, number] // [lng, lat]
  title?: string
  description?: string
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
}

// ============================================================================
// PROPS & EMITS
// ============================================================================

const props = withDefaults(defineProps<Props>(), {
  markers: () => [],
  center: () => [6.1432, 46.2044], // Genève
  zoom: 1,
  darkMode: true
})

const emit = defineEmits<{
  markerClick: [marker: MapMarker]
  mapLoad: [view: MapView]
}>()

// ============================================================================
// CONFIGURATION ArcGIS SITG
// ============================================================================

// Portail ArcGIS Enterprise de Genève
esriConfig.portalUrl = 'https://app2.ge.ch/tergeoportal'

// URL du VectorTileServer SITG "Tons sombres"
const SITG_VECTOR_TILE_URL = 'https://vector.sitg.ge.ch/arcgis/rest/services/Hosted/PLAN_SITG_EPSG3857/VectorTileServer'
// PortalItem ID pour le style "Tons sombres"
const SITG_PORTAL_ITEM_ID = '753d065ee1ba4d29be9a6de655abd94f'

// ============================================================================
// REFS & STATE
// ============================================================================

const mapContainer = ref<HTMLDivElement | null>(null)
const markersContainer = ref<HTMLDivElement | null>(null)
const mapError = ref<string | null>(null)

// Popup state
const activePopup = ref<MapMarker | null>(null)
const popupPosition = ref({ x: 0, y: 0 })

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

const loadAllDurations = () => {
  for (const lieu of lieux.value) {
    if (lieu.audio?.url) {
      loadAudioDuration(lieu.slug, lieu.audio.url)
    }
  }
}

/**
 * Récupère l'URL audio d'un marker à partir des données podcast
 */
function getAudioUrlForMarker(marker: MapMarker): string | null {
  const slug = marker.slug || String(marker.id)
  const lieu = getLieuBySlug(slug)
  return lieu?.audio?.url || null
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
}

let view: MapView | null = null
let esriMap: EsriMap | null = null

// Stockage des éléments DOM des markers
const markerElements = new Map<string | number, HTMLElement>()
// Stockage des données markers
const markerDataMap = new Map<string | number, MapMarker>()

// Handle pour l'animation frame
let updateMarkersRAF: number | null = null

// ============================================================================
// POPUP MANAGEMENT
// ============================================================================

function openPopup(marker: MapMarker, screenPoint: { x: number; y: number }) {
  // Positionner la popup au-dessus du marker
  popupPosition.value = {
    x: screenPoint.x,
    y: screenPoint.y - 10 // Décalage vers le haut
  }
  activePopup.value = marker
}

function closePopup() {
  activePopup.value = null
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
  
  // Gestionnaire de clic
  el.addEventListener('click', (e) => {
    e.stopPropagation()
    
    // Recentrer la carte sur le marker
    if (view) {
      const point = new Point({
        longitude: marker.coordinates[0],
        latitude: marker.coordinates[1]
      })
      view.goTo({ target: point }, { duration: 500 }).then(() => {
        // Ouvrir la popup une fois le recentrage terminé
        const screenPoint = view!.toScreen(point)
        if (screenPoint && markersContainer.value) {
          openPopup(marker, {
            x: screenPoint.x,
            y: screenPoint.y
          })
        }
      })
    }
    
    emit('markerClick', marker)
  })
  
  return el
}

/**
 * Met à jour la position de tous les markers HTML sur l'écran
 * Utilise requestAnimationFrame pour la performance
 */
function updateMarkersPosition() {
  if (!view || !markersContainer.value) return
  
  markerElements.forEach((el, id) => {
    const markerData = markerDataMap.get(id)
    if (!markerData) return
    
    const point = new Point({
      longitude: markerData.coordinates[0],
      latitude: markerData.coordinates[1]
    })
    
    const screenPoint = view!.toScreen(point)
    
    if (screenPoint) {
      // Utiliser transform pour de meilleures performances
      el.style.transform = `translate(${screenPoint.x}px, ${screenPoint.y}px)`
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
 * Ajoute les markers HTML sur la carte
 */
function addMarkers() {
  if (!view || !markersContainer.value) return
  
  // Supprimer les markers existants
  clearMarkers()
  
  // Ajouter les nouveaux markers
  props.markers.forEach((markerData) => {
    const el = createMarkerElement(markerData)
    
    // Stocker les données et l'élément
    markerDataMap.set(markerData.id, markerData)
    markerElements.set(markerData.id, el)
    
    // Ajouter au DOM
    markersContainer.value!.appendChild(el)
  })
  
  // Mettre à jour les positions
  updateMarkersPosition()
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
  
  try {
    mapError.value = null
    
    // Créer le VectorTileLayer avec le style SITG "Tons sombres"
    const sitgLayer = new VectorTileLayer({
      portalItem: {
        id: SITG_PORTAL_ITEM_ID,
        portal: {
          url: esriConfig.portalUrl
        }
      }
    })
    
    // Créer la Map avec le VectorTileLayer comme basemap
    esriMap = new EsriMap({
      basemap: {
        baseLayers: [sitgLayer]
      }
    })
    
    // Créer la vue
    view = new MapView({
      container: mapContainer.value,
      map: esriMap,
      center: props.center,
      zoom: props.zoom,
      ui: {
        components: ['zoom'] // Garder uniquement le contrôle de zoom
      },
      constraints: {
        rotationEnabled: false,
        minZoom: 5,
        maxZoom: 10,
      }
    })
    
    // Positionner le zoom en haut à droite
    view.ui.move('zoom', 'bottom-left')
    
    // Attendre que la vue soit prête
    await view.when()
    
    // Désactiver le zoom par scroll (molette/trackpad)
    // pour que le scroll continue de faire défiler la page
    // Le double-clic reste actif pour zoomer
    view.on('mouse-wheel', (event) => {
      event.stopPropagation()
    })
    
    // Ajouter les markers HTML initiaux
    addMarkers()
    
    // Mettre à jour les positions des markers quand la carte bouge
    view.watch('extent', () => {
      scheduleMarkersUpdate()
    })
    
    // Aussi lors des animations (zoom/pan)
    view.watch('animation', () => {
      scheduleMarkersUpdate()
    })
    
    // Fermer la popup quand on clique sur la carte (pas sur un marker)
    view.on('click', () => {
      closePopup()
    })
    
    // Fermer la popup quand on drag la carte
    view.on('drag', () => {
      closePopup()
    })
    
    // Émettre l'événement de chargement
    emit('mapLoad', view)
    
    console.log('[MapView] ArcGIS map initialized with SITG style "Tons sombres" and HTML markers')
    
  } catch (error: unknown) {
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

// ============================================================================
// LIFECYCLE & WATCHERS
// ============================================================================

onMounted(async () => {
  await nextTick()
  console.log('[MapView] Container:', mapContainer.value)
  initMap()
  // Charger les durées audio
  if (isLoaded.value) {
    loadAllDurations()
  }
})

// Charger les durées quand les données podcast deviennent disponibles
watch(isLoaded, (loaded) => {
  if (loaded) {
    loadAllDurations()
  }
})

onBeforeUnmount(() => {
  // Annuler l'animation frame en cours
  if (updateMarkersRAF) {
    cancelAnimationFrame(updateMarkersRAF)
    updateMarkersRAF = null
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
    if (!view) return
    
    const extent = new Extent({
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
   MAP CONTAINER
   ============================================================================ */

.map-view {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.map-view__container {
  width: 100%;
  height: 100%;
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
  z-index: 50;
  overflow: hidden;
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
  transition: transform 0.15s ease-out;
}

.map-view__marker:hover {
  transform: scale(1.15);
  z-index: 10;
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
}

/* ============================================================================
   CUSTOM POPUP
   ============================================================================ */

.map-view__popup {
  position: absolute;
  transform: translate(-50%, -125%);
  z-index: 200;
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



/* Conteneur des boutons zoom */
.map-view .esri-zoom {
  background: transparent !important;
  box-shadow: none !important;
}

/* Override des variables Calcite pour les boutons */
.map-view .esri-widget--button,
.map-view .esri-widget--button:is(calcite-button) {
  --calcite-icon-color: white !important;
  --calcite-color-text-3: white !important;
  --calcite-color-foreground-1: var(--red) !important;
  --calcite-color-foreground-2: var(--red) !important;
  --calcite-color-foreground-3: var(--red) !important;
  width: 36px;
  height: 36px;
  color: white !important;
  background: var(--red) !important;
  border: none !important;
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

/* Style map-card pour les popups */
.map-card--popup {
  display: flex;
  flex-flow: row;
  width: 320px;
  height: 160px;
  position: relative;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  inset: auto auto auto auto;
}

.map-card--popup .map-card_image_wrapper {
  width: 50%;
  height: 100%;
  position: relative;
  flex-shrink: 0;
}

.map-card--popup .audio-card_image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.map-card--popup .audio-card_image-placeholder {
  width: 100%;
  height: 100%;
  min-height: 120px;
  background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-card--popup .audio-card_image-placeholder span {
  font-size: 32px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.3);
}

.map-card--popup .map-card_image_wrapper.no-image {
  background: #1a1a1a;
}

.map-card--popup .audio-card_button {
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px 4px 4px;
  transition: background 0.2s ease;
}

.map-card--popup .audio-card_button:hover {
  background: rgba(0, 0, 0, 1);
}


.map-card--popup .audio-card_button .image {
  width: 16px;
  height: 16px;
}

.map-card--popup .audio-card_time {
  color: white;
  font-size: 11px;
}

.map-card--popup .map-card_info {
  width: 50%;
  height: 100%;
  padding: 12px;
  background-color: var(--green, #2D5A27);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
}

.map-card--popup .audio-card_info_wrapper {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.map-card--popup .audio-card_number {
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}

.map-card--popup .audio-card_title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.map-card--popup .audio-card_info_text {
  margin: 8px 0 0 0;
  font-size: 12px;
  opacity: 0.9;
  line-height: 1.4;
}
</style>
