<template>
  <div class="list" id="partenaires">
    <h2 class="list_title">{{ title }}</h2>
    <div class="list_wrapper">
      <div class="list_line">
        <div class="list_line_wrapper is-partenaires">
          <NuxtLink 
            v-for="(partner, index) in partners" 
            :key="index" 
            :to="partner.link"
            class="list_case is-partenaires"
            target="_blank"
          >
            <img 
              :src="partner.logo" 
              loading="lazy" 
              :alt="partner.name" 
              class="list_image"
            >
            <p class="list_label is-partenaires">
              <strong>{{ partner.name }}</strong><br>
              {{ partner.description }}
            </p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Partenaires'
  },
  partners: {
    type: Array,
    default: () => []
  }
})
</script>

<style lang="scss">
</style>
