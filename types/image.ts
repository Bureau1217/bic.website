/**
 * Structure d'image responsive retournée par le plugin Kirby historia/images.
 *
 * Le backend ne sert JAMAIS l'URL originale du fichier brut (souvent 5–12 Mo).
 * À la place, chaque image passe par $file->historiaImage($preset) qui génère :
 *   - un fallback (jpeg/png) au format max du preset + srcset multi-largeurs
 *   - un srcset WebP (meilleure compression, supporté partout)
 *
 * Le composant <ResponsivePicture> consomme ce type directement.
 */
export type ResponsiveImage = {
  /** Texte alternatif de l'image */
  alt?: string

  /** Attribut sizes par défaut (peut être surchargé côté composant) */
  sizes?: string

  /** Métadonnées de l'image originale (debug / calcul ratio) */
  original?: {
    width?: number
    height?: number
    mime?: string
  }

  /** Fallback JPEG/PNG : src unique + srcset multi-largeurs */
  fallback: {
    src: string
    srcset?: string
    width?: number
    height?: number
  }

  /** Source WebP (meilleure compression, ~95 % de support navigateurs) */
  webp?: {
    srcset?: string
  }
}

/**
 * Helper de type guard : vérifie si une valeur est un objet ResponsiveImage
 * plutôt qu'une simple string URL (rétrocompatibilité).
 */
export function isResponsiveImage(value: unknown): value is ResponsiveImage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'fallback' in value &&
    typeof (value as ResponsiveImage).fallback?.src === 'string'
  )
}

/**
 * Extrait l'URL de fallback d'une image, qu'elle soit au format
 * ResponsiveImage ou une simple string (rétrocompatibilité).
 */
export function getImageSrc(image: ResponsiveImage | string | null | undefined): string {
  if (!image) return ''
  if (typeof image === 'string') return image
  return image.fallback?.src ?? ''
}
