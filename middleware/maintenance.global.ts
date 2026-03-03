/**
 * Middleware global pour le mode maintenance
 *
 * Si MAINTENANCE_MODE=true :
 * - Redirige toutes les pages vers /maintenance
 * - Sauf si l'utilisateur a le cookie "preview" ou le paramètre ?preview=true
 *
 * Pour tester le vrai site pendant la maintenance :
 * - Ajouter ?preview=true à n'importe quelle URL
 * - Un cookie sera stocké pour 24h permettant de naviguer normalement
 */
export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig()
  const maintenanceMode = config.public.maintenanceMode

  // Si pas en mode maintenance, ne rien faire
  if (!maintenanceMode) return

  // Ne pas rediriger si on est déjà sur la page maintenance
  if (to.path === '/maintenance') return

  // Vérifier le paramètre ?preview=true
  if (to.query.preview === 'true') {
    // Stocker un cookie pour permettre la navigation
    const previewCookie = useCookie('preview', {
      maxAge: 60 * 60 * 24, // 24 heures
    })
    previewCookie.value = 'true'
    return
  }

  // Vérifier si le cookie preview existe
  const previewCookie = useCookie('preview')
  if (previewCookie.value === 'true') {
    return
  }

  // Rediriger vers la page maintenance
  return navigateTo('/maintenance')
})
