import { prewarmMapAssets } from '~/composables/useArcgisModules.client'

export default defineNuxtPlugin((nuxtApp) => {
  let hasStartedPrewarm = false

  const safePrewarm = () => {
    if (hasStartedPrewarm) return
    hasStartedPrewarm = true
    void prewarmMapAssets().catch((error) => {
      console.warn('[map-prewarm] prewarm skipped:', error)
    })
  }

  const scheduleIdlePrewarm = () => {
    const browserWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
    }

    if (typeof browserWindow.requestIdleCallback === 'function') {
      browserWindow.requestIdleCallback(() => safePrewarm(), { timeout: 2500 })
      return
    }

    window.setTimeout(safePrewarm, 900)
  }

  if (document.readyState === 'complete') {
    scheduleIdlePrewarm()
  } else {
    window.addEventListener('load', scheduleIdlePrewarm, { once: true })
  }

  nuxtApp.$router.afterEach((to) => {
    const path = to.path
    const isMapHeavyRoute =
      path === '/' ||
      path === '/parcours' ||
      path.startsWith('/parcours/')

    if (isMapHeavyRoute) {
      safePrewarm()
    }
  })
})
