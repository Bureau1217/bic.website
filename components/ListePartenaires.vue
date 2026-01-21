<template>
  <div class="list" id="partenaires">
    <h2 class="list_title">{{ title }}</h2>
    <div class="list_wrapper">
      <div 
        v-for="(row, rowIndex) in partnersRows" 
        :key="rowIndex" 
        class="list_line"
      >
        <div class="list_line_wrapper">
          <div 
            v-for="(partner, partnerIndex) in row" 
            :key="partnerIndex" 
            class="list_case"
          >
            <img 
              :src="partner.logo" 
              loading="lazy" 
              :alt="partner.name" 
              class="list_image"
            >
            <p class="list_label">
              <strong>{{ partner.name }}</strong><br>
              {{ partner.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Partenaires'
  },
  partners: {
    type: Array,
    default: () => []
  },
  columnsPerRow: {
    type: Number,
    default: 3
  }
})

// Group partners into rows of columnsPerRow
const partnersRows = computed(() => {
  const rows = []
  for (let i = 0; i < props.partners.length; i += props.columnsPerRow) {
    rows.push(props.partners.slice(i, i + props.columnsPerRow))
  }
  return rows
})
</script>

<style lang="scss">
</style>
