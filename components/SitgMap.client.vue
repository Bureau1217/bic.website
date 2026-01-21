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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

/**
 * URLs des styles SITG - À remplacer par les URLs officielles SITG
 * Documentation: https://sitg.ge.ch → Services WEB API
 * 
 * Pour utiliser le style SITG sombre officiel, remplacez DEFAULT_STYLE
 * par l'URL correcte du style JSON de GEODE/SITG
 */
const DEFAULT_STYLE = 'https://demotiles.maplibre.org/style.json'

// Props
interface Props {
  center?: [number, number] // [lng, lat]
  zoom?: number
  styleUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [6.14, 46.20], // Genève
  zoom: 12,
  styleUrl: ''
})

// Refs
const mapContainer = ref<HTMLElement | null>(null)
let map: maplibregl.Map | null = null

const computedStyleUrl = computed(() => props.styleUrl || DEFAULT_STYLE)

onMounted(async () => {
  await nextTick()
  
  if (!mapContainer.value) return

  try {
    map = new maplibregl.Map({
      container: mapContainer.value,
      style: computedStyleUrl.value,
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
