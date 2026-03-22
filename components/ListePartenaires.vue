<template>
  <div class="list" id="partenaires">
    <h2 class="list_title">{{ title }}</h2>
    <div class="list_wrapper">
      <div
        v-for="(partner, index) in partners"
        :key="index"
        class="list_line"
      >
        <div class="list_line_wrapper">
          <div class="list_case partenaire-nom">
            <p class="list_label is-bold">{{ partner.name }}</p>
          </div>
          <div class="list_case partenaire-paragraphe">
            <p class="list_label">{{ partner.description }}</p>
          </div>
          <div class="list_case partenaire-lien">
            <a
              v-if="partner.link"
              :href="partner.link"
              target="_blank"
              rel="noopener noreferrer"
              class="list_label"
            >
              Lien
            </a>
          </div>
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
