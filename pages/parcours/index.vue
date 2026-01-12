<template>
  <main class="v-parcours">
    <AppHeader />

    <section v-if="data?.status === 'ok'" class="v-parcours__content">
      <div class="v-parcours__intro">
        <AppBlocks :blocks="data.result.parcours.titre" />
        <AppBlocks :blocks="data.result.parcours.soustitre" />
      </div>

      <div v-if="data.result.parcours.cover?.url" class="v-parcours__cover">
        <img
          :src="data.result.parcours.cover.url"
          :alt="data.result.parcours.cover.alt || data.result.parcours.title"
          loading="lazy"
        />
      </div>

      <h1>{{ data.result.parcours.title }}</h1>

      <div class="v-parcours__children">
        <NuxtLink
          v-for="item in data.result.parcours.children"
          :key="item.slug"
          :to="`/parcours/${item.slug}`"
          class="v-parcours__children__item"
        >
          <div>{{ item.title }}</div>
          <small class="v-parcours__meta">{{ item.template }}</small>
        </NuxtLink>
      </div>
    </section>

    <section v-else class="v-parcours__error">
      Oups, la page n'existe pas :/
    </section>
  </main>
</template>

<script setup lang="ts">
type ParcoursChild = CMS_API_PageItem & {
  template: string
}

type FetchData = CMS_API_Response & {
  result: {
    parcours: {
      title: string
      slug: string
      titre: CMS_API_Block[]
      soustitre: CMS_API_Block[]
      cover: CMS_API_File | null
      children: ParcoursChild[]
    }
  }
}

const { data } = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `site`,
    select: {
      parcours: {
        query: "site.find('parcours')",
        select: {
          title: true,
          slug: true,
          titre: 'page.titre.toBlocks',
          soustitre: 'page.soustitre.toBlocks',
          cover: {
            query: 'page.cover.toFile',
            select: {
              url: true,
              alt: true,
            },
          },
          children: {
            query: 'page.children()',
            select: {
              title: true,
              slug: true,
              template: true,
            },
          },
        },
      },
    },
  },
})
</script>
