<template>
  <div class="list is-last" id="edito">
    <h2 class="list_title is-edito">{{ title }}</h2>
    <div class="list_wrapper">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="list_line list_line--edito"
        @click="toggleItem(index)"
      >
        <div class="list_plus">
          <div class="list_plus_line"></div>
          <div class="list_plus_line is-vertical" v-show="!openItems[index]"></div>
        </div>
        <div class="list_line_wrapper">
          <div class="list_case list_case--half">
            <p v-if="item.name" class="list_label is-bold">{{ item.name }}</p>
          </div>
          <div class="list_case list_case--half">
            <p class="list_label is-bold">{{ item.title }}</p>
          </div>
        </div>
        <Transition
          v-if="item.description"
          @before-enter="beforeEnter"
          @enter="enter"
          @after-enter="afterEnter"
          @before-leave="beforeLeave"
          @leave="leave"
          @after-leave="afterLeave"
        >
          <div
            v-show="openItems[index]"
            class="list_line_wrapper list_line_wrapper--edito-description"
          >
            <div class="list_case list_case--half">
              <p class="list_dev_text list_dev_text--edito">{{ item.description }}</p>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

type EditoItem = {
  name: string
  title: string
  description: string
}

const props = withDefaults(defineProps<{
  title?: string
  items?: EditoItem[]
}>(), {
  title: 'Édito',
  items: () => [],
})

const openItems = reactive<Record<number, boolean>>({})

const initializeOpenItems = (items: EditoItem[]) => {
  Object.keys(openItems).forEach((key) => {
    delete openItems[Number(key)]
  })

  items.forEach((_, index) => {
    openItems[index] = false
  })
}

watch(
  () => props.items,
  (items) => initializeOpenItems(items),
  { immediate: true },
)

const toggleItem = (index: number) => {
  openItems[index] = !openItems[index]
}

const transitionTiming =
  'height 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease, padding-top 0.45s cubic-bezier(0.22, 1, 0.36, 1), padding-bottom 0.45s cubic-bezier(0.22, 1, 0.36, 1)'

const beforeEnter = (el: Element) => {
  const htmlEl = el as HTMLElement
  const computedStyle = window.getComputedStyle(htmlEl)
  htmlEl.dataset.paddingTop = computedStyle.paddingTop
  htmlEl.dataset.paddingBottom = computedStyle.paddingBottom
  htmlEl.style.height = '0'
  htmlEl.style.opacity = '0'
  htmlEl.style.paddingTop = '0'
  htmlEl.style.paddingBottom = '0'
  htmlEl.style.overflow = 'hidden'
  htmlEl.style.transition = transitionTiming
}

const enter = (el: Element) => {
  const htmlEl = el as HTMLElement
  const targetPaddingTop = htmlEl.dataset.paddingTop || '0px'
  const targetPaddingBottom = htmlEl.dataset.paddingBottom || '0px'
  htmlEl.style.paddingTop = targetPaddingTop
  htmlEl.style.paddingBottom = targetPaddingBottom
  const targetHeight = htmlEl.scrollHeight
  void htmlEl.offsetHeight
  htmlEl.style.height = `${targetHeight}px`
  htmlEl.style.opacity = '1'
}

const afterEnter = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = 'auto'
  htmlEl.style.overflow = ''
  htmlEl.style.paddingTop = ''
  htmlEl.style.paddingBottom = ''
  htmlEl.style.transition = ''
}

const beforeLeave = (el: Element) => {
  const htmlEl = el as HTMLElement
  const computedStyle = window.getComputedStyle(htmlEl)
  htmlEl.dataset.paddingTop = computedStyle.paddingTop
  htmlEl.dataset.paddingBottom = computedStyle.paddingBottom
  htmlEl.style.paddingTop = htmlEl.dataset.paddingTop
  htmlEl.style.paddingBottom = htmlEl.dataset.paddingBottom
  htmlEl.style.height = `${htmlEl.scrollHeight}px`
  htmlEl.style.opacity = '1'
  htmlEl.style.overflow = 'hidden'
  htmlEl.style.transition = transitionTiming
}

const leave = (el: Element) => {
  const htmlEl = el as HTMLElement
  void htmlEl.offsetHeight
  htmlEl.style.height = '0'
  htmlEl.style.opacity = '0'
  htmlEl.style.paddingTop = '0'
  htmlEl.style.paddingBottom = '0'
}

const afterLeave = (el: Element) => {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = ''
  htmlEl.style.opacity = ''
  htmlEl.style.overflow = ''
  htmlEl.style.paddingTop = ''
  htmlEl.style.paddingBottom = ''
  htmlEl.style.transition = ''
  delete htmlEl.dataset.paddingTop
  delete htmlEl.dataset.paddingBottom
}
</script>

<style lang="scss">
.list_line--edito {
  cursor: pointer;
}

.list_case--half {
  width: 50%;
}

.list_line_wrapper--edito-description {
  margin-top: 0;
  padding-top: var(--10);
}

.list_dev_text--edito {
  margin-top: 0;
}

@media screen and (max-width: 991px) {
  .list_case--half {
    width: 100%;
  }
}
</style>
