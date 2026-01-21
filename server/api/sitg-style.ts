// Proxy pour le style SITG - Résout les problèmes de CORS et URLs relatives
export default defineEventHandler(async () => {
  const SITG_STYLE_URL = 'https://vector.sitg.ge.ch/arcgis/rest/services/Hosted/PLAN_SITG_EPSG3857/VectorTileServer/resources/styles/root.json'
  const SITG_BASE_URL = 'https://vector.sitg.ge.ch/arcgis/rest/services/Hosted/PLAN_SITG_EPSG3857/VectorTileServer'

  try {
    const response = await fetch(SITG_STYLE_URL)
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to fetch SITG style'
      })
    }
    
    const style = await response.json()
    
    // Convertir les URLs relatives en URLs absolues
    if (style.sprite && style.sprite.startsWith('../')) {
      style.sprite = `${SITG_BASE_URL}/resources/${style.sprite.replace('../', '')}`
    }
    if (style.glyphs && style.glyphs.startsWith('../')) {
      style.glyphs = `${SITG_BASE_URL}/resources/${style.glyphs.replace('../', '')}`
    }
    
    // Convertir l'URL des sources - forcer les tuiles directes
    if (style.sources?.esri) {
      style.sources.esri = {
        type: 'vector',
        tiles: [`${SITG_BASE_URL}/tile/{z}/{y}/{x}.pbf`],
        minzoom: 0,
        maxzoom: 19
      }
    }
    
    return style
  } catch (error) {
    console.error('[sitg-style] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load SITG style'
    })
  }
})
