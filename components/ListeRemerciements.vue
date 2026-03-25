<template>
  <div class="list is-last" id="remerciements">
    <h3 class="list_title">{{ title }}</h3>
    <div class="list_wrapper">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="list_line"
      >
        <div class="list_line_header" @click="toggleItem(index)">
          <div class="list_plus" >
            <div class="list_plus_line"></div>
            <div class="list_plus_line is-vertical" v-show="!openItems[index]"></div>
          </div>
          <div class="list_line_wrapper">
            <div class="list_case">
              <p class="list_label"><strong>{{ item.nom }}</strong></p>
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
          <div class="list_dev" v-show="openItems[index]">
            <div class="list_dev_line is-remerciements">
              <div class="list_case">
                <p class="list_label list_description">{{ item.paragraphe }}</p>
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
    default: 'Remerciements'
  },
  items: {
    type: Array,
    default: () => []
  }
})

const openItems = reactive({})

// Initialize all items as closed
props.items.forEach((_, index) => {
  openItems[index] = false
})

const toggleItem = (index) => {
  openItems[index] = !openItems[index]
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
  align-items: flex-start;
  width: 100%;
  cursor: pointer;
}

.list_description {
  white-space: pre-line;
}
</style>
