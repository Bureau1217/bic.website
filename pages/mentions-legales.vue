<template>
  <main class="v-legal">
    <AppHeader />

    <section v-if="data?.status === 'ok' && data.result" class="v-legal__content">
      <h1>{{ data.result.title }}</h1>
      <div v-if="data.result.content" class="v-legal__layout" v-html="data.result.content" />
      <div v-else class="v-legal__empty">Aucun contenu pour le moment.</div>
    </section>

    <section v-else class="v-legal__error">
      Oups, la page n'existe pas :/
    </section>
  </main>
</template>

<script setup lang="ts">
type FetchData = CMS_API_Response & {
  result: {
    title: string
    slug: string
    content?: string | null
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
      content: 'page.layout.toBlocks.toHtml',
    },
  },
})
</script>
