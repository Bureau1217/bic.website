<template>
  <button
    class="v-app-button outlined"
    :class="{ 'is-selected': selected }"
    @click="$emit('click')"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps<{
  label?: string
  selected?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

