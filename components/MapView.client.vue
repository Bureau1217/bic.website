<template>
  <div class="map-view">
    <div ref="mapContainer" class="map-view__container"></div>
    
    <!-- Attribution SITG -->
    <div class="map-view__attribution">
      Source : ICDG / SITG (État de Genève)
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

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
  zoom: 12,
  darkMode: true
})

const emit = defineEmits<{
  markerClick: [marker: MapMarker]
  mapLoad: [map: maplibregl.Map]
}>()

// ============================================================================
// CONFIGURATION SITG
// ============================================================================

const SITG_BASE_URL = 'https://vector.sitg.ge.ch/arcgis/rest/services/Hosted/PLAN_SITG_EPSG3857/VectorTileServer'

/**
 * Charge le style SITG via l'API proxy locale (évite CORS)
 * L'API corrige déjà les URLs relatives
 */
async function loadSitgStyle(): Promise<maplibregl.StyleSpecification> {
  const response = await fetch('/api/sitg-style')
  
  if (!response.ok) {
    throw new Error(`Failed to load SITG style: ${response.status}`)
  }
  
  const style = await response.json()
  
  // S'assurer que les URLs sont absolues
  if (!style.sprite?.startsWith('http')) {
    style.sprite = `${SITG_BASE_URL}/resources/sprites/sprite`
  }
  if (!style.glyphs?.startsWith('http')) {
    style.glyphs = `${SITG_BASE_URL}/resources/fonts/{fontstack}/{range}.pbf`
  }
  
  // Forcer les tuiles en format direct
  if (style.sources?.esri) {
    style.sources.esri = {
      type: 'vector',
      tiles: [`${SITG_BASE_URL}/tile/{z}/{y}/{x}.pbf`],
      minzoom: 0,
      maxzoom: 19
    }
  }
  
  return style
}

// ============================================================================
// REFS & STATE
// ============================================================================

const mapContainer = ref<HTMLElement | null>(null)
let map: maplibregl.Map | null = null
const markersOnMap: maplibregl.Marker[] = []

// ============================================================================
// MARKERS MANAGEMENT
// ============================================================================

/**
 * Crée un élément DOM custom pour un marker
 */
function createMarkerElement(marker: MapMarker): HTMLElement {
  const el = document.createElement('div')
  el.className = 'map-view__marker'
  
  if (marker.icon) {
    // Si c'est une URL d'image
    if (marker.icon.startsWith('http') || marker.icon.startsWith('/')) {
      el.innerHTML = `<img src="${marker.icon}" alt="${marker.title || ''}" />`
    } else {
      // Sinon c'est un emoji ou du texte
      el.innerHTML = marker.icon
    }
  } else {
    // Marker par défaut (point)
    el.innerHTML = `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="${marker.color || '#E63946'}"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `
  }
  
  // Style personnalisé si couleur définie
  if (marker.color && !marker.icon) {
    el.style.setProperty('--marker-color', marker.color)
  }
  
  return el
}

/**
 * Crée le contenu HTML d'une popup avec le style AudioCardMap
 */
function createPopupContent(marker: MapMarker): string {
  const number = marker.number || ''
  const title = marker.title || ''
  const description = marker.description || ''
  // Utilise imagepodcast, sinon picto, sinon un placeholder coloré
  const image = marker.image || marker.icon || ''
  const hasImage = !!image
  const duration = marker.duration || ''
  const slug = marker.slug || marker.id
  
  console.log('[MapView] Popup marker:', { title, image, icon: marker.icon })
  
  return `
    <a href="/parcours/${slug}" class="map-card map-card--popup">
      <div class="map-card_image_wrapper ${!hasImage ? 'no-image' : ''}">
        ${hasImage ? `
          <img 
            src="${image}" 
            loading="lazy" 
            alt="${title}" 
            class="audio-card_image"
            onerror="this.style.display='none'"
          >
        ` : `
          <div class="audio-card_image-placeholder">
            <span>${number || '?'}</span>
          </div>
        `}
        ${duration ? `
        <div class="audio-card_button">
          <img src="/images/Picto-Podcast-jaune.svg" loading="lazy" alt="" class="image">
          <div class="audio-card_time">${duration}</div>
        </div>
        ` : ''}
      </div>
      <div class="map-card_info">
        <div class="audio-card_info_wrapper">
          ${number ? `<div class="audio-card_number">${number}.</div>` : ''}
          <p class="audio-card_title">${title}</p>
        </div>
        ${description ? `<p class="audio-card_info_text">${description}</p>` : ''}
      </div>
    </a>
  `
}

/**
 * Ajoute les markers sur la carte
 */
function addMarkers() {
  if (!map) return
  
  // Supprimer les markers existants
  clearMarkers()
  
  // Ajouter les nouveaux markers
  props.markers.forEach((markerData) => {
    const el = createMarkerElement(markerData)
    
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat(markerData.coordinates)
    
    // Ajouter une popup avec style AudioCardMap
    const popup = new maplibregl.Popup({
      offset: [0, -10],
      closeButton: false,
      closeOnClick: true,
      className: 'map-card-popup',
      maxWidth: 'none'
    }).setHTML(createPopupContent(markerData))
    
    marker.setPopup(popup)
    
    // Event click
    el.addEventListener('click', () => {
      emit('markerClick', markerData)
    })
    
    marker.addTo(map!)
    markersOnMap.push(marker)
  })
}

/**
 * Supprime tous les markers de la carte
 */
function clearMarkers() {
  markersOnMap.forEach(marker => marker.remove())
  markersOnMap.length = 0
}

// ============================================================================
// MAP INITIALIZATION
// ============================================================================

async function initMap() {
  if (!mapContainer.value) return
  
  try {
    // Charger le style SITG avec URLs corrigées
    const style = await loadSitgStyle()
    
    // Créer la carte
    map = new maplibregl.Map({
      container: mapContainer.value,
      style: style,
      center: props.center,
      zoom: props.zoom,
      attributionControl: false // On utilise notre propre attribution
    })
    
    // Ajouter les contrôles de navigation
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    
    // Attendre que la carte soit chargée
    map.on('load', () => {
      addMarkers()
      emit('mapLoad', map!)
    })
    
    // Gérer les erreurs
    map.on('error', (e) => {
      console.error('[MapView] Map error:', e.error?.message || e)
    })
    
  } catch (error) {
    console.error('[MapView] Failed to initialize map:', error)
  }
}

// ============================================================================
// LIFECYCLE & WATCHERS
// ============================================================================

onMounted(async () => {
  await nextTick()
  console.log('[MapView] Container:', mapContainer.value)
  initMap()
})

onBeforeUnmount(() => {
  clearMarkers()
  if (map) {
    map.remove()
    map = null
  }
})

// Réagir aux changements de markers
watch(() => props.markers, () => {
  if (map?.loaded()) {
    addMarkers()
  }
}, { deep: true })

// Réagir aux changements de center/zoom
watch([() => props.center, () => props.zoom], ([newCenter, newZoom]) => {
  if (map) {
    map.flyTo({
      center: newCenter,
      zoom: newZoom,
      duration: 1000
    })
  }
})

// ============================================================================
// EXPOSE
// ============================================================================

defineExpose({
  getMap: () => map,
  flyTo: (center: [number, number], zoom?: number) => {
    map?.flyTo({ center, zoom: zoom || props.zoom, duration: 1000 })
  },
  fitBounds: (bounds: [[number, number], [number, number]], padding = 50) => {
    map?.fitBounds(bounds, { padding })
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
   DARK MODE - Filtre CSS sur le canvas uniquement
   Les markers et popups ne sont PAS affectés car ils sont en dehors du canvas
   ============================================================================ */

.map-view__container .maplibregl-canvas {
  filter: invert(1) grayscale(1) hue-rotate(180deg) brightness(0.9) contrast(1.1);
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
   MARKERS
   ============================================================================ */

.map-view__marker {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.map-view__marker:hover {
  transform: scale(1.1);
}

.map-view__marker img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.map-view__marker svg {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* ============================================================================
   POPUPS - Style AudioCardMap
   ============================================================================ */

.map-card-popup .maplibregl-popup-content {
  padding: 0;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
}

.map-card-popup .maplibregl-popup-tip {
  display: none;
}

/* Style map-card pour les popups */
.map-card--popup {
  display: flex;
  flex-flow: row;
  width: 320px;
  min-height: 120px;
  position: relative;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
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
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 4px;
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

/* ============================================================================
   NAVIGATION CONTROLS
   ============================================================================ */

.map-view .maplibregl-ctrl-group {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.map-view .maplibregl-ctrl-group button {
  width: 36px;
  height: 36px;
}
</style>
