<template>
  <div class="list" id="ressources">
    <h2 class="list_title">{{ title }}</h2>
    <div class="list_wrapper">
      <div 
        v-for="(category, categoryIndex) in categories" 
        :key="categoryIndex" 
        class="list_line"
      >
        <div class="list_plus" @click="toggleCategory(categoryIndex)">
          <div class="list_plus_line"></div>
          <div class="list_plus_line is-vertical" v-show="!openCategories[categoryIndex]"></div>
        </div>
        <div class="list_line_wrapper">
          <div class="list_case">
            <p class="list_label"><strong>{{ category.name }}</strong></p>
          </div>
          <div class="list_case is-telecharger">
            <p class="list_label"><strong>Télécharger</strong></p>
          </div>
        </div>
        <div class="list_dev" v-show="openCategories[categoryIndex]">
          <div 
            v-for="(item, itemIndex) in category.items" 
            :key="itemIndex" 
            class="list_dev_line"
          >
            <div class="list_case">
              <p class="list_label">{{ item.label }}</p>
            </div>
            <div class="list_case is-last">
              <a :href="item.link" class="list_label">{{ item.downloadText || 'Article pdf' }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Ressources'
  },
  categories: {
    type: Array,
    default: () => [
      {
        name: 'Article',
        items: [
          { label: 'Le Temps - Restaurant "Le Portugais"', link: '#', downloadText: 'Article pdf' }
        ]
      }
    ]
  }
})

const openCategories = reactive({})

// Initialize all categories as closed
props.categories.forEach((_, index) => {
  openCategories[index] = false
})

const toggleCategory = (index) => {
  openCategories[index] = !openCategories[index]
}
</script>

<style lang="scss">
</style>
