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
      
      <!-- Image simple -->
      <div v-else-if="block.type === 'image' && block.content?.image?.url" class="block-image">
        <img 
          :src="block.content.image.url"
          loading="lazy" 
          :alt="block.content.image.alt || block.content.alt || ''" 
          class="block-image_image"
        >
        <p v-if="block.content.caption" class="block-image_legende">{{ block.content.caption }}</p>
      </div>
      
      <!-- Citation -->
      <blockquote v-else-if="block.type === 'quote'" class="block-quote">
        <p v-if="block.content?.text" v-html="block.content.text" />
        <footer v-if="block.content?.citation" v-html="block.content.citation" />
      </blockquote>

      <!-- Galerie -->
      <BlockGallery
        v-else-if="block.type === 'gallery' && block.content?.images?.length"
        :images="block.content.images"
        :caption="block.content.caption"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
/** Bloc avec contenu résolu */
type ResolvedBlock = {
  id?: string
  type: string
  content?: {
    text?: string
    level?: string
    image?: { url: string; alt?: string } | null
    images?: { url: string; alt?: string }[]
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
</script>

<style lang="scss">

</style>
