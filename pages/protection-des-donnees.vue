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
    /** SEO fields */
    metaDescription: string | null
    ogTitle: string | null
    ogDescription: string | null
    ogImage: string | null
  } | null
}

const { data } = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: "site.find('protection-des-donnees')",
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
      // SEO fields
      metaDescription: 'page.metaDescription.value',
      ogTitle: 'page.metadata.ogTitle.value',
      ogDescription: 'page.metadata.ogDescription.value',
      ogImage: 'page.metadata.ogImage',
    },
  },
})

useHead(() => ({
  title: data.value?.result?.title || 'Protection des donnees',
  meta: [
    {
      name: 'description',
      content: data.value?.result?.metaDescription || '',
    },
    {
      property: 'og:title',
      content: data.value?.result?.ogTitle || data.value?.result?.title || 'Protection des donnees',
    },
    {
      property: 'og:description',
      content: data.value?.result?.ogDescription || data.value?.result?.metaDescription || '',
    },
    {
      property: 'og:image',
      content: data.value?.result?.ogImage || '',
    },
    {
      property: 'og:type',
      content: 'website',
    },
  ],
}))
</script>
