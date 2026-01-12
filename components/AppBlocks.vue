<template>
  <div v-if="blocks?.length" class="v-blocks">
    <component
      v-for="block in blocks"
      :is="resolveTag(block)"
      :key="block.id"
      v-html="block.content?.text ?? ''"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  blocks?: CMS_API_Block[]
}>()

const resolveTag = (block: CMS_API_Block) => {
  if (block.type === 'heading') {
    const level = block.content?.level
    if (typeof level === 'string' && /^h[1-6]$/.test(level)) {
      return level
    }
    return 'h2'
  }
  return 'div'
}
</script>

