<template>
  <main class="v-legal">

    <template v-if="data?.status === 'ok' && data.result">
      <ListeMentions 
      :title="data.result.title" 
      :items="data.result.items ?? []" />
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
    ogImage: { url: string } | null
  } | null
}

const { data } = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: "site.find('mentions-legales')",
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
      ogTitle: 'page.metaTitle.value',
      ogDescription: 'page.ogDescription.value',
      ogImage: {
        query: 'page.ogImage.toFile',
        select: { url: true },
      },
    },
  },
})

// Normaliser les URLs d'images du CMS (WhatsApp exige des URLs absolues)
const { normalizeUrl } = useImageUrl()

useHead(() => ({
  title: data.value?.result?.title || 'Mentions legales',
  meta: [
    {
      name: 'description',
      content: data.value?.result?.metaDescription || '',
    },
    {
      property: 'og:title',
      content: data.value?.result?.ogTitle || data.value?.result?.title || 'Mentions legales',
    },
    {
      property: 'og:description',
      content: data.value?.result?.ogDescription || data.value?.result?.metaDescription || '',
    },
    {
      property: 'og:image',
      content: normalizeUrl(data.value?.result?.ogImage?.url),
    },
    {
      property: 'og:image:width',
      content: '1200',
    },
    {
      property: 'og:image:height',
      content: '630',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:url',
      content: 'https://notrehistoria.ch/mentions-legales',
    },
  ],
}))
</script>
