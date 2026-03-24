<template>
  <div class="list" id="partenaires">
    <h3 class="list_title">{{ title }}</h3>
    <div class="list_wrapper">
      <div
        v-for="(partner, index) in partners"
        :key="index"
        class="list_line"
      >
        <component
          :is="partner.link ? 'a' : 'div'"
          class="list_line_wrapper"
          :href="partner.link || undefined"
          :target="partner.link ? '_blank' : undefined"
          :rel="partner.link ? 'noopener noreferrer' : undefined"
        >
          <div class="list_case partenaire-nom">
            <p class="list_label is-bold">{{ partner.name }}</p>
          </div>
          <div class="list_case partenaire-paragraphe">
            <p class="list_label">{{ partner.description }}</p>
          </div>
          <div class="list_case partenaire-lien">

          </div>
        </component>
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
.list_line_wrapper {
  text-decoration: none;
  color: inherit;
}

.partenaire-nom {
  flex: 1;
}

.partenaire-paragraphe {
  flex: 2;
}

.partenaire-lien {
  flex: 1;
}
</style>
