<template>
  <!--
    Composant <ResponsivePicture>
    Rend un <picture> avec source WebP + fallback JPEG/PNG.
    Consomme le type ResponsiveImage retourné par le plugin Kirby historia/images.

    Rétrocompatibilité : si `image` est une string (ancienne API), 
    affiche un simple <img>.
  -->

  <!-- Cas string URL (rétrocompatibilité ancienne API) -->
  <img
    v-if="typeof image === 'string'"
    :src="image"
    :alt="alt || ''"
    :loading="loading"
    :decoding="decoding"
    :class="pictureClass"
  >

  <!-- Cas ResponsiveImage (nouvelle API) -->
  <picture v-else-if="image?.fallback?.src" :class="pictureClass">
    <!-- WebP : meilleure compression, ~95% de support navigateurs -->
    <source
      v-if="image.webp?.srcset"
      type="image/webp"
      :srcset="image.webp.srcset"
      :sizes="resolvedSizes"
    >
    <!-- Fallback JPEG/PNG : compatibilité universelle -->
    <img
      :src="image.fallback.src"
      :srcset="image.fallback.srcset || undefined"
      :sizes="image.fallback.srcset ? resolvedSizes : undefined"
      :alt="resolvedAlt"
      :width="image.fallback.width || undefined"
      :height="image.fallback.height || undefined"
      :loading="loading"
      :decoding="decoding"
    >
  </picture>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResponsiveImage } from '~/types/image'

interface Props {
  /** Image au format ResponsiveImage (nouvelle API) ou string URL (rétrocompatibilité) */
  image: ResponsiveImage | string | null | undefined
  /** Surcharge de l'attribut sizes (prioritaire sur image.sizes) */
  sizes?: string
  /** Surcharge du texte alternatif */
  alt?: string
  /** Chargement lazy (défaut) ou eager (above the fold) */
  loading?: 'lazy' | 'eager'
  /** Stratégie de décodage */
  decoding?: 'async' | 'auto' | 'sync'
  /** Classes CSS appliquées au <picture> (ou <img> en fallback string) */
  pictureClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  sizes: undefined,
  alt: undefined,
  loading: 'lazy',
  decoding: 'async',
  pictureClass: undefined,
})

/**
 * Résolution du `sizes` :
 *   1. Prop `sizes` du composant (priorité max, override par usage)
 *   2. `image.sizes` retourné par l'API (default du preset Kirby)
 *   3. Fallback safe : "100vw"
 */
const resolvedSizes = computed(() => {
  if (props.sizes) return props.sizes
  if (typeof props.image === 'object' && props.image?.sizes) return props.image.sizes
  return '100vw'
})

/**
 * Résolution du alt :
 *   1. Prop `alt` du composant (override explicite)
 *   2. `image.alt` retourné par l'API
 *   3. Chaîne vide (conformité accessibilité)
 */
const resolvedAlt = computed(() => {
  if (props.alt !== undefined) return props.alt
  if (typeof props.image === 'object' && props.image?.alt) return props.image.alt
  return ''
})
</script>

