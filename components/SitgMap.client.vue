<template>
  <div class="map">
    <div class="sitg-map-wrapper">
      <div ref="mapContainer" class="sitg-map-container"></div>
      <div class="sitg-map-attribution">
        Source : ICDG / SITG (État de Genève)
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

/**
 * Style de carte - Par défaut utilise le style de démo MapLibre
 * 
 * Pour utiliser le style SITG "tons sombres", tu as 2 options :
 * 
 * 1. Proxy côté serveur : Créer une route API Nuxt qui fetch le style SITG
 *    et modifie les URLs relatives en absolues, puis le sert localement.
 * 
 * 2. Style local : Télécharger le style SITG depuis
 *    https://vector.sitg.ge.ch/arcgis/rest/services/Hosted/PLAN_SITG_EPSG3857/VectorTileServer/resources/styles/root.json
 *    Modifier les URLs relatives ("../sprites/sprite" → URL absolue)
 *    Placer le fichier dans public/ et l'utiliser
 */
// Style SITG via proxy local (résout CORS + URLs relatives)
const DEFAULT_STYLE = '/api/sitg-style'

// Props
interface Props {
  center?: [number, number]
  zoom?: number
  styleUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [6.14, 46.20], // Genève
  zoom: 12,
  styleUrl: ''
})

const mapContainer = ref<HTMLElement | null>(null)
let map: maplibregl.Map | null = null

onMounted(async () => {
  await nextTick()
  if (!mapContainer.value) return

  try {
    map = new maplibregl.Map({
      container: mapContainer.value,
      style: props.styleUrl || DEFAULT_STYLE,
      center: props.center,
      zoom: props.zoom,
      attributionControl: false
    })

    map.on('error', (e) => {
      console.error('[SitgMap] Error:', e.error?.message || e)
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
  } catch (error) {
    console.error('[SitgMap] Init error:', error)
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})

defineExpose({ getMap: () => map })
</script>

<style scoped>
.map {
  width: 100%;
  height: 100vh;
  position: relative;
}

.sitg-map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.sitg-map-container {
  width: 100%;
  height: 100%;
}

.sitg-map-attribution {
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
</style>
