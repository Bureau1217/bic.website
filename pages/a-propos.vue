<template>
  <main class="v-apropos">
    <AppHeader />

    <section v-if="data?.status === 'ok'" class="v-apropos__content">
      <h1>{{ data.result.apropos.title }}</h1>

      <div v-if="data.result.apropos.layout" class="v-apropos__layout" v-html="data.result.apropos.layout" />

      <section class="v-apropos__contact">
        <h2>Contact</h2>
        <div v-if="data.result.apropos.address" v-html="data.result.apropos.address" />
        <div v-if="data.result.apropos.email">
          <a :href="`mailto:${data.result.apropos.email}`">{{ data.result.apropos.email }}</a>
        </div>
        <div v-if="data.result.apropos.phone">
          <a :href="`tel:${data.result.apropos.phone}`">{{ data.result.apropos.phone }}</a>
        </div>
      </section>

      <section class="v-apropos__partners">
        <h2>Partenaires</h2>
        <div v-if="!data.result.apropos.partenaires.length">Aucun partenaire.</div>
        <div v-else class="v-apropos__partners__grid">
          <img
            v-for="logo in data.result.apropos.partenaires"
            :key="logo.url"
            :src="logo.url"
            :alt="logo.alt || 'Partenaire'"
            loading="lazy"
          />
        </div>
      </section>
    </section>

    <section v-else class="v-apropos__error">
      Oups, la page n'existe pas :/
    </section>
  </main>
</template>

<script setup lang="ts">
type FetchData = CMS_API_Response & {
  result: {
    apropos: {
      title: string
      slug: string
      layout: string | null
      address: string | null
      email: string | null
      phone: string | null
      partenaires: CMS_API_File[]
    }
  }
}

const { data } = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: 'site',
    select: {
      apropos: {
        query: "site.find('a-propos')",
        select: {
          title: true,
          slug: true,
          layout: 'page.layout.toBlocks.toHtml',
          address: true,
          email: true,
          phone: true,
          partenaires: {
            query: 'page.partenaires.toFiles',
            select: {
              url: true,
              alt: true,
            },
          },
        },
      },
    },
  },
})
</script>
