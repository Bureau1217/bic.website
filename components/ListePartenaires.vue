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
            <p class="list_label is-partenaires">
              <strong>{{ partner.name }}</strong>
              {{ partner.description }}
            </p>
          </component>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type PartnerItem = {
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
</style>
