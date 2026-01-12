<template>
  <main class="v-ressources">
    <AppHeader />

    <section v-if="data?.status === 'ok'" class="v-ressources__content">
      <AppBlocks :blocks="data.result.ressources.titre" />
      <AppBlocks :blocks="data.result.ressources.soustitre" />

      <div v-if="data.result.ressources.cover?.url" class="v-ressources__cover">
        <img
          :src="data.result.ressources.cover.url"
          :alt="data.result.ressources.cover.alt || data.result.ressources.title"
          loading="lazy"
        />
      </div>

      <section class="v-ressources__section">
        <h2>Ressources</h2>
        <div v-if="!data.result.ressources.ressources.length">
          Aucune ressource pour le moment.
        </div>
        <ul v-else>
          <li v-for="item in data.result.ressources.ressources" :key="item.nom">
            <strong>{{ item.nom }}</strong>
            <span v-if="item.tag"> - {{ item.tag }}</span>
            <span v-if="item.lien">
              -
              <a :href="item.lien" target="_blank" rel="noopener">Lien</a>
            </span>
            <span v-if="item.fichier?.url">
              -
              <a :href="item.fichier.url" target="_blank" rel="noopener">Fichier</a>
            </span>
          </li>
        </ul>
      </section>

      <section class="v-ressources__section">
        <h2>Agenda</h2>
        <div v-if="!data.result.ressources.evenements.length">
          Aucun evenement pour le moment.
        </div>
        <ul v-else>
          <li v-for="item in data.result.ressources.evenements" :key="`${item.nom}-${item.date}`">
            <strong>{{ item.nom }}</strong>
            <div>
              {{ item.date }} {{ item.heuredebut }} {{ item.heurefin }}
            </div>
            <div>{{ item.lieu }}</div>
            <p v-if="item.description">{{ item.description }}</p>
          </li>
        </ul>
      </section>

      <section class="v-ressources__section">
        <h2>{{ data.result.ressources.journal.titre || 'Notre journal' }}</h2>
        <p v-if="data.result.ressources.journal.texte">
          {{ data.result.ressources.journal.texte }}
        </p>
        <AppButton
          v-if="data.result.ressources.journal.bouton_url"
          :label="data.result.ressources.journal.bouton_texte || 'Lire'"
          @click="goToJournal"
        />
      </section>
    </section>

    <section v-else class="v-ressources__error">
      Oups, la page n'existe pas :/
    </section>
  </main>
</template>

<script setup lang="ts">
type ReferenceRessource = {
  nom: string
  tag: string | string[] | null
  lien: string | null
  fichier?: CMS_API_File | null
}

type ReferenceEvent = {
  date: string | null
  heuredebut: string | null
  heurefin: string | null
  nom: string | null
  description: string | null
  lieu: string | null
}

type FetchData = CMS_API_Response & {
  result: {
    ressources: {
      title: string
      slug: string
      titre: CMS_API_Block[]
      soustitre: CMS_API_Block[]
      cover: CMS_API_File | null
      ressources: ReferenceRessource[]
      evenements: ReferenceEvent[]
      journal: {
        titre: string | null
        texte: string | null
        bouton_texte: string | null
        bouton_url: string | null
      }
    }
  }
}

const { data } = await useFetch<FetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: `site`,
    select: {
      ressources: {
        query: "site.find('ressources')",
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
          ressources: {
            query: 'page.ressources.toStructure()',
            select: {
              nom: 'structureItem.nom.value',
              tag: 'structureItem.tag.value',
              lien: 'structureItem.lien.value',
              fichier: {
                query: 'structureItem.fichier.toFile',
                select: {
                  url: true,
                  filename: true,
                },
              },
            },
          },
          evenements: {
            query: 'page.evenements.toStructure()',
            select: {
              date: 'structureItem.date.value',
              heuredebut: 'structureItem.heuredebut.value',
              heurefin: 'structureItem.heurefin.value',
              nom: 'structureItem.nom.value',
              description: 'structureItem.description.value',
              lieu: 'structureItem.lieu.value',
            },
          },
          journal: {
            titre: 'page.journal_titre.value',
            texte: 'page.journal_texte.value',
            bouton_texte: 'page.journal_bouton_texte.value',
            bouton_url: 'page.journal_bouton_url.value',
          },
        },
      },
    },
  },
})

const goToJournal = () => {
  const url = data.value?.result.ressources.journal.bouton_url
  if (url) {
    window.open(url, '_blank', 'noopener')
  }
}
</script>
