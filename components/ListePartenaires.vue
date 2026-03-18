<template>
  <div class="list is-last" id="partenaires">
    <h2 class="list_title">{{ title }}</h2>
    <div class="list_wrapper">
      <div class="list_line is-partenaires">
        <div class="list_line_wrapper is-partenaires">
          <component
            v-for="(partner, index) in partners" 
            :key="index" 
            :is="partner.link ? 'a' : 'div'"
            :href="partner.link || undefined"
            class="list_case is-partenaires"
            :target="partner.link ? '_blank' : undefined"
            :rel="partner.link ? 'noopener noreferrer' : undefined"
          >
          <h3 class="list_label is-bold">{{ partner.name }}</h3>  
          <p class="list_label is-partenaires">{{ partner.description }}</p>
          </component>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type PartnerItem = {
  logo: string
  logoAlt?: string
  logoWidth?: number
  logoHeight?: number
  name: string
  description: string
  link: string | null
}

withDefaults(defineProps<{
  title?: string
  partners?: PartnerItem[]
}>(), {
  title: 'Partenaires',
  partners: () => [],
})
</script>

<style lang="scss">
.list_case.is-partenaires {
  display: flex;
}

.list_image_wrapper {
  width: 100%;
  max-width: 150px;
  aspect-ratio: 5 / 3;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.list_image--partner {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  margin-bottom: 0;
}
</style>
