<template>
  <main class="v-parcours-slug">
    <AppHeader />

    <section v-if="data?.status === 'ok' && data.result" class="v-parcours-slug__content">
      <h1>{{ data.result.title }}</h1>

      <div v-if="data.result.cover?.url" class="v-parcours-slug__cover">
        <img
          :src="data.result.cover.url"
          :alt="data.result.cover.alt || data.result.title"
          loading="lazy"
        />
      </div>

      <div v-if="imagepodcast?.url" class="v-parcours-slug__image">
        <img
          :src="imagepodcast.url"
          :alt="imagepodcast.alt || data.result.title"
          loading="lazy"
        />
      </div>

      <div v-if="data.result.texte" class="v-parcours-slug__texte" v-html="data.result.texte" />

      <div v-if="audio?.url" class="v-parcours-slug__audio">
        <audio controls :src="audio.url" />
      </div>

      <div v-if="data.result.layout" class="v-parcours-slug__layout" v-html="data.result.layout" />
    </section>

    <section v-else class="v-parcours-slug__error">
      Oups, la page n'existe pas :/
    </section>
  </main>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

type FetchData = CMS_API_Response & {
  result: {
    title: string
    slug: string
    template: string
    texte?: string
    layout?: string | null
    cover?: CMS_API_File | null
    imagepodcast?: CMS_API_File | null
    imagepodcastFile?: CMS_API_File | null
    audio?: CMS_API_File | null
    audioFile?: CMS_API_File | null
  } | null
}

const { data } = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `site.find('parcours').childrenAndDrafts().published().find('${slug}')`,
    select: {
      title: true,
      slug: true,
      template: true,
      texte: true,
      layout: 'page.layout.toBlocks.toHtml',
      cover: {
        query: 'page.cover.toFile',
        select: {
          url: true,
          alt: true,
        },
      },
      imagepodcast: {
        query: 'page.imagepodcast.toFile',
        select: {
          url: true,
          alt: true,
        },
      },
      imagepodcastFile: {
        query: "page.files.template('poster').first",
        select: {
          url: true,
          alt: true,
        },
      },
      audio: {
        query: 'page.content.audio.toFile',
        select: {
          url: true,
          filename: true,
        },
      },
      audioFile: {
        query: "page.files.template('audio').first",
        select: {
          url: true,
          filename: true,
        },
      },
    },
  },
})

const imagepodcast = computed(() => data.value?.result?.imagepodcast || data.value?.result?.imagepodcastFile)
const audio = computed(() => data.value?.result?.audio || data.value?.result?.audioFile)
</script>
