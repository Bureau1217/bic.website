<template>
  <main class="v-legal">

    <template v-if="data?.status === 'ok' && data.result">
      <ListeMentions :title="data.result.title" :items="data.result.items ?? []" />
    </template>

  </main>
</template>

<script setup lang="ts">
type FetchData = CMS_API_Response & {
  result: {
    title: string
    slug: string
    items: Array<{ nom: string; description: string }> | null
  } | null
}

const { data } = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: "site.find('engagement')",
    select: {
      title: true,
      slug: true,
      items: {
        query: 'page.items.toStructure',
        select: {
          nom: true,
          description: true,
        },
      },
    },
  },
})
</script>
