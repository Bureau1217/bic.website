<template>
  <div class="list" id="ressources">
    <h2 class="list_title">{{ title }}</h2>
    <div class="list_wrapper">
      <div
        v-for="(category, categoryIndex) in categories"
        :key="categoryIndex"
        class="list_line"
      >
        <div class="list_line_header" @click="toggleCategory(categoryIndex)">
          <div class="list_plus">
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
        </div>
        <Transition
          @before-enter="beforeEnter"
          @enter="enter"
          @after-enter="afterEnter"
          @before-leave="beforeLeave"
          @leave="leave"
          @after-leave="afterLeave"
        >
          <div class="list_dev" v-show="openCategories[categoryIndex]">
            <div 
              v-for="(item, itemIndex) in category.items" 
              :key="itemIndex" 
              class="list_dev_line is-ressources"
            >
              <div class="list_case">
                <p class="list_label">{{ item.label }}</p>
              </div>
              <div class="list_case">
                <a v-if="item.downloadText" :href="item.link" target="_blank" rel="noopener noreferrer" class="list_label">{{ item.downloadText }}</a>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

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

const transitionTiming =
  'height 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease, padding-top 0.45s cubic-bezier(0.22, 1, 0.36, 1), padding-bottom 0.45s cubic-bezier(0.22, 1, 0.36, 1)'

const beforeEnter = (el) => {
  const computedStyle = window.getComputedStyle(el)
  el.dataset.paddingTop = computedStyle.paddingTop
  el.dataset.paddingBottom = computedStyle.paddingBottom
  el.style.height = '0'
  el.style.opacity = '0'
  el.style.paddingTop = '0'
  el.style.paddingBottom = '0'
  el.style.overflow = 'hidden'
  el.style.transition = transitionTiming
}

const enter = (el) => {
  const targetPaddingTop = el.dataset.paddingTop || '0px'
  const targetPaddingBottom = el.dataset.paddingBottom || '0px'
  el.style.paddingTop = targetPaddingTop
  el.style.paddingBottom = targetPaddingBottom
  const targetHeight = el.scrollHeight
  void el.offsetHeight
  el.style.height = `${targetHeight}px`
  el.style.opacity = '1'
}

const afterEnter = (el) => {
  el.style.height = 'auto'
  el.style.overflow = ''
  el.style.paddingTop = ''
  el.style.paddingBottom = ''
  el.style.transition = ''
}

const beforeLeave = (el) => {
  const computedStyle = window.getComputedStyle(el)
  el.dataset.paddingTop = computedStyle.paddingTop
  el.dataset.paddingBottom = computedStyle.paddingBottom
  el.style.paddingTop = el.dataset.paddingTop
  el.style.paddingBottom = el.dataset.paddingBottom
  el.style.height = `${el.scrollHeight}px`
  el.style.opacity = '1'
  el.style.overflow = 'hidden'
  el.style.transition = transitionTiming
}

const leave = (el) => {
  void el.offsetHeight
  el.style.height = '0'
  el.style.opacity = '0'
  el.style.paddingTop = '0'
  el.style.paddingBottom = '0'
}

const afterLeave = (el) => {
  el.style.height = ''
  el.style.opacity = ''
  el.style.overflow = ''
  el.style.paddingTop = ''
  el.style.paddingBottom = ''
  el.style.transition = ''
  delete el.dataset.paddingTop
  delete el.dataset.paddingBottom
}
</script>

<style lang="scss">
.list_line_header {
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
}
</style>
