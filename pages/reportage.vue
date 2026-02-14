<template>
  <main class="v-reportage">

    <section v-if="data?.status === 'ok'" class="v-reportage__content">
      <h1>{{ data.result.reportage.title }}</h1>

      <section class="v-reportage__section">
        <h2>Episodes</h2>
        <div v-if="!data.result.episodes.length">
          Aucun episode pour le moment.
        </div>
        <ul v-else>
          <li v-for="item in data.result.episodes" :key="item.slug">
            <NuxtLink :to="`/parcours/${item.slug}`">{{ item.title }}</NuxtLink>
          </li>
        </ul>
      </section>
    </section>

    <section v-else class="v-reportage__error">
      Oups, la page n'existe pas :/
    </section>
  </main>
</template>

<script setup lang="ts">
type FetchData = CMS_API_Response & {
  result: {
    reportage: {
      title: string
      slug: string
    }
    episodes: CMS_API_PageItem[]
  }
}

const { data } = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: 'site',
    select: {
      reportage: {
        query: "site.find('reportage')",
        select: {
          title: true,
          slug: true,
        },
      },
      episodes: {
        query: "site.find('parcours').childrenAndDrafts().published().filterBy('intendedTemplate', 'episode')",
        select: {
          title: true,
          slug: true,
        },
      },
    },
  },
})
</script>
