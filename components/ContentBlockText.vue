<template>
  <div class="block-text" :class="{ 'is-auto': isAuto }">
    <template v-for="(block, index) in blocks" :key="block.id ?? index">
      <!-- Heading -->
      <component
        v-if="block.type === 'heading'"
        :is="getHeadingTag(block)"
        v-html="block.content?.text"
      />
      
      <!-- Text (paragraphe) -->
      <div
        v-else-if="block.type === 'text'"
        class="block_p"
        v-html="block.content?.text"
      />
      
      <!-- Image simple : responsive (AVIF + WebP + fallback) -->
      <div v-else-if="block.type === 'image' && hasImage(block)" class="block-image">
        <ResponsivePicture
          :image="block.content?.image"
          sizes="(min-width: 1024px) 800px, 100vw"
          :alt="block.content?.alt || undefined"
          picture-class="block-image_picture"
        />
        <p v-if="block.content?.caption" class="block-image_legende">{{ block.content.caption }}</p>
      </div>
      
      <!-- Citation -->
      <blockquote v-else-if="block.type === 'quote'" class="block-quote">
        <p v-if="block.content?.text" v-html="block.content.text" />
        <footer v-if="block.content?.citation" v-html="block.content.citation" />
      </blockquote>

      <!-- Galerie : images responsive -->
      <BlockGallery
        v-else-if="block.type === 'gallery' && block.content?.images?.length"
        :images="block.content.images"
        :caption="block.content.caption"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ResponsiveImage } from '~/types/image'
import { isResponsiveImage } from '~/types/image'

/** Bloc avec contenu résolu (images au format responsive) */
type ResolvedBlock = {
  id?: string
  type: string
  content?: {
    text?: string
    level?: string
    /** Image responsive ou ancien format { url, alt } */
    image?: ResponsiveImage | { url: string; alt?: string } | null
    /** Images de galerie au format responsive */
    images?: (ResponsiveImage | { url: string; alt?: string })[]
    caption?: string
    citation?: string
    alt?: string
    [key: string]: unknown
  }
}

defineProps<{
  blocks?: ResolvedBlock[]
  isAuto?: boolean
}>()

// Détermine la balise h1-h6 selon le niveau
function getHeadingTag(block: ResolvedBlock): string {
  const level = block.content?.level
  if (typeof level === 'string' && /^h[1-6]$/.test(level)) {
    return level
  }
  return 'h2'
}

/**
 * Vérifie si un bloc image a une image valide
 * (format responsive avec fallback.src OU ancien format avec url)
 */
function hasImage(block: ResolvedBlock): boolean {
  const img = block.content?.image
  if (!img) return false
  if (isResponsiveImage(img)) return true
  return typeof (img as any).url === 'string' && (img as any).url.length > 0
}
</script>

<style lang="scss">
</style>
