<template>
  <div v-if="blocks?.length" class="v-blocks">
    <template v-for="block in blocks" :key="block.id">
      <h1 v-if="block.type === 'heading' && block.content?.level === 'h1'" v-html="block.content?.text ?? ''" />
      <h2 v-else-if="block.type === 'heading' && block.content?.level === 'h2'" v-html="block.content?.text ?? ''" />
      <h3 v-else-if="block.type === 'heading' && block.content?.level === 'h3'" v-html="block.content?.text ?? ''" />
      <h4 v-else-if="block.type === 'heading' && block.content?.level === 'h4'" v-html="block.content?.text ?? ''" />
      <h5 v-else-if="block.type === 'heading' && block.content?.level === 'h5'" v-html="block.content?.text ?? ''" />
      <h6 v-else-if="block.type === 'heading' && block.content?.level === 'h6'" v-html="block.content?.text ?? ''" />
      <div v-else v-html="block.content?.text ?? ''" />
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  blocks?: CMS_API_Block[]
}>()
</script>

