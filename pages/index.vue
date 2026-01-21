<template>
  <main class="v-home">
    <Menu />

    <SitgMap />

    <PortraitSlider />

    <ListeAgenda />

    <AppFooter />



    <section v-if="data?.status === 'ok'" class="v-home__content">
      <div class="v-home__intro">
        <AppBlocks :blocks="data.result.home.titre" />
        <AppBlocks :blocks="data.result.home.soustitre" />
      </div>

      <div v-if="data.result.home.cover?.url" class="v-home__cover">
        <img
          :src="data.result.home.cover.url"
          :alt="data.result.home.cover.alt || data.result.home.title"
          loading="lazy"
        />
      </div>

      <section class="v-home__nav">
        <h2>Explorer</h2>
        <ul>
          <li v-for="item in data.result.nav" :key="item.slug">
            <NuxtLink :to="`/${item.slug}`">
              {{ item.title }}
            </NuxtLink>
          </li>
        </ul>
      </section>
    </section>

    <section v-else class="v-home__error">
      Oups, la page n'existe pas :/
    </section>
    <AppFooter />
  </main>
</template>

<script setup lang="ts">
type FetchData = CMS_API_Response & {
  result: {
    home: {
      title: string
      slug: string
      titre: CMS_API_Block[]
      soustitre: CMS_API_Block[]
      cover: CMS_API_File | null
    }
    nav: CMS_API_PageItem[]
  }
}

const { data } = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: 'site',
    select: {
      home: {
        query: "site.find('home')",
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
              width: true,
              height: true,
            },
          },
        },
      },
      nav: {
        query: 'site.children().listed()',
        select: {
          title: true,
          slug: true,
        },
      },
    },
  },
})
</script>

