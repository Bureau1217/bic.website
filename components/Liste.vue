<template>
  <div class="list" id="faq">
    <h2 class="list_title">{{ title }}</h2>
    <div class="list_wrapper">
      <div 
        v-for="(item, index) in items" 
        :key="index" 
        class="list_line"
      >
        <div class="list_line_wrapper">
          <div class="list_case">
            <p class="list_label"><strong>{{ item.question }}</strong></p>
          </div>
          <div class="list_case">
            <p class="list_label">{{ item.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Faq'
  },
  items: {
    type: Array,
    default: () => [
      {
        question: 'Aenean faucibus nibh ?',
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      }
    ]
  }
})
</script>

<style lang="scss">
</style>
