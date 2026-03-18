<template>
  <div class="list is-last" id="edito">
    <h2 class="list_title is-edito">{{ title }}</h2>
    <div class="list_wrapper">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="list_line list_line--edito"
      >
        <div class="list_line_wrapper">
          <div class="list_case list_case--half">
            <p v-if="item.name" class="list_label is-bold">{{ item.name }}</p>
          </div>
          <div class="list_case list_case--half">
            <p class="list_label is-bold">{{ item.title }}</p>
          </div>
        </div>
        <div v-if="item.description" class="list_line_wrapper list_line_wrapper--edito-description">
          <div class="list_case list_case--half">
            <p class="list_dev_text list_dev_text--edito">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type EditoItem = {
  name: string
  title: string
  description: string
}

withDefaults(defineProps<{
  title?: string
  items?: EditoItem[]
}>(), {
  title: 'Edito',
  items: () => [],
})
</script>

<style lang="scss">
.list_line--edito {
  cursor: default;
}

.list_case--half {
  width: 50%;
}

.list_line_wrapper--edito-description {
  margin-top: var(--10);
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
