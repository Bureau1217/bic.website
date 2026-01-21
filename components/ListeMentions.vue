<template>
  <div class="list" id="mentions-legales">
    <h2 class="list_title">{{ title }}</h2>
    <div class="list_wrapper">
      <div 
        v-for="(item, index) in items" 
        :key="index" 
        class="list_line"
      >
        <div class="list_line_wrapper">
          <div class="list_case">
            <p class="list_label"><strong>{{ item.label }}</strong></p>
          </div>
          <div class="list_case">
            <p class="list_label">{{ item.content }}</p>
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
    default: 'Mentions Légales'
  },
  items: {
    type: Array,
    default: () => [
      {
        label: 'Éditeur du site',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      }
    ]
  }
})
</script>

<style lang="scss">
</style>
