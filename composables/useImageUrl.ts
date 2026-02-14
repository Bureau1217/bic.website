import type { ResponsiveImage } from '~/types/image'

/**
 * Composable pour normaliser les URLs d'images du CMS.
 *
 * Si Kirby retourne des URLs relatives (ex: /media/pages/...),
 * ce helper les préfixe avec l'URL de base du CMS (runtimeConfig.public.cmsBaseUrl).
 * Les URLs déjà absolues (http:// ou https://) sont retournées telles quelles.
 */
export function useImageUrl() {
  const config = useRuntimeConfig()
  const cmsBaseUrl = (config.public.cmsBaseUrl as string).replace(/\/+$/, '')

  /**
   * Normalise une URL simple (string) en URL absolue.
   */
  function normalizeUrl(url: string | undefined | null): string {
    if (!url) return ''
    // Déjà absolue
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      return url
    }
    // URL relative → préfixer avec la base CMS
    return `${cmsBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`
  }

  /**
   * Normalise toutes les URLs à l'intérieur d'un srcset.
   * Un srcset est de la forme : "url1 640w, url2 960w, ..."
   */
  function normalizeSrcset(srcset: string | undefined | null): string {
    if (!srcset) return ''
    return srcset
      .split(',')
      .map(entry => {
        const parts = entry.trim().split(/\s+/)
        if (parts.length >= 2) {
          return `${normalizeUrl(parts[0])} ${parts.slice(1).join(' ')}`
        }
        return normalizeUrl(parts[0])
      })
      .join(', ')
  }

  /**
   * Normalise un objet ResponsiveImage complet :
   * toutes les URLs (fallback.src, fallback.srcset, webp.srcset, avif.srcset)
   * deviennent absolues.
   */
  function normalizeResponsiveImage(image: ResponsiveImage | null | undefined): ResponsiveImage | null {
    if (!image) return null
    return {
      ...image,
      fallback: {
        ...image.fallback,
        src: normalizeUrl(image.fallback.src),
        srcset: normalizeSrcset(image.fallback.srcset),
      },
      webp: image.webp ? { srcset: normalizeSrcset(image.webp.srcset) } : undefined,
    }
  }

  return {
    normalizeUrl,
    normalizeSrcset,
    normalizeResponsiveImage,
  }
}
