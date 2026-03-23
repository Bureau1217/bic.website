type ArcGISModules = {
  esriConfig: any
  EsriMap: any
  MapView: any
  VectorTileLayer: any
  Point: any
  Extent: any
}

let arcgisModules: ArcGISModules | null = null
let arcgisLoadPromise: Promise<ArcGISModules> | null = null

export async function loadArcGISModules(): Promise<ArcGISModules> {
  if (arcgisModules) return arcgisModules
  if (arcgisLoadPromise) return arcgisLoadPromise

  arcgisLoadPromise = (async () => {
    // Charger ArcGIS à la demande pour ne pas pénaliser le FCP/LCP.
    await import('@arcgis/core/assets/esri/themes/dark/main.css')

    const [
      { default: esriConfig },
      { default: EsriMap },
      { default: MapView },
      { default: VectorTileLayer },
      { default: Point },
      { default: Extent },
    ] = await Promise.all([
      import('@arcgis/core/config'),
      import('@arcgis/core/Map'),
      import('@arcgis/core/views/MapView'),
      import('@arcgis/core/layers/VectorTileLayer'),
      import('@arcgis/core/geometry/Point'),
      import('@arcgis/core/geometry/Extent'),
    ])

    esriConfig.portalUrl = 'https://app2.ge.ch/tergeoportal'

    arcgisModules = {
      esriConfig,
      EsriMap,
      MapView,
      VectorTileLayer,
      Point,
      Extent,
    }

    return arcgisModules
  })()

  return arcgisLoadPromise
}

export async function prewarmMapAssets(): Promise<void> {
  // Précharger le chunk du composant carte + runtime ArcGIS.
  await Promise.all([
    import('~/components/MapView.client.vue'),
    loadArcGISModules(),
  ])
}
