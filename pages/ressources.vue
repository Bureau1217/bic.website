<template>
  <main class="v-ressources">
    <Menu />
    <section class="page_header">
      <AppBlocks :blocks="data?.result?.ressources?.titre" />
      <AppBlocks :blocks="data?.result?.ressources?.soustitre" />
    </section>


    <ListeAgenda 
      v-if="data?.result?.ressources?.evenements" 
      title="Agenda" 
      :events="formattedEvents" 
    />

    <Journal
      :title="data?.result?.ressources?.journal_titre || 'Notre journal'"
      :text="data?.result?.ressources?.journal_texte || ''"
      :button-text="data?.result?.ressources?.journal_bouton_texte || ''"
      :button-url="data?.result?.ressources?.journal_bouton_url || '#'"
    />

    <ListeRessource 
      v-if="data?.result?.ressources?.ressources" 
      title="Références" 
      :categories="formattedRessources" 
    />

    <section v-if="hasRemerciementSection" class="page_header">
      <h2 v-if="remerciementTitle">{{ remerciementTitle }}</h2>
      <p v-if="remerciementText" class="ressources-remerciement_text">{{ remerciementText }}</p>
    </section>

  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Journal from '~/components/Journal.vue'

// TYPES
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
      journal_titre: string | null
      journal_texte: string | null
      journal_bouton_texte: string | null
      journal_bouton_url: string | null
      remerciement_title: string | null
      remerciement_text: string | null
    }
  }
}

// FETCH DONNEES RESOURCES
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
          journal_titre: 'page.journal_titre.value',
          journal_texte: 'page.journal_texte.value',
          journal_bouton_texte: 'page.journal_bouton_texte.value',
          journal_bouton_url: 'page.journal_bouton_url.value',
          remerciement_title: 'page.remerciement_title.value',
          remerciement_text: 'page.remerciement_text.value',
        },
      },
    },
  },
})

useHead(() => ({
  title: data.value?.result?.ressources?.title || 'Ressources',
}))

// Transformer les ressources du CMS pour le composant ListeRessource (groupées par tag)
const formattedRessources = computed(() => {
  const ressources = data.value?.result?.ressources?.ressources
  if (!ressources) return []
  
  // Grouper par tag
  const grouped: Record<string, typeof ressources> = {}
  
  ressources.forEach((item) => {
    const tag = (Array.isArray(item.tag) ? item.tag[0] : item.tag) || 'Autre'
    if (!grouped[tag]) {
      grouped[tag] = []
    }
    grouped[tag].push(item)
  })
  
  // Convertir en format attendu par le composant
  return Object.entries(grouped).map(([tagName, items]) => ({
    name: tagName,
    items: items.map((item) => ({
      label: item.nom,
      link: item.fichier?.url || item.lien || '#',
      downloadText: item.fichier?.url ? 'Télécharger' : (item.lien ? 'Lien' : '')
    }))
  }))
})

// Transformer les événements du CMS pour le composant ListeAgenda
const formattedEvents = computed(() => {
  const events = data.value?.result?.ressources?.evenements
  if (!events) return []
  
  return events.map((event) => {
    // Formater la date avec les heures
    let dateStr = event.date || ''
    if (event.heuredebut) {
      dateStr += ` - ${event.heuredebut}`
    }
    if (event.heurefin) {
      dateStr += ` à ${event.heurefin}`
    }
    
    return {
      date: dateStr,
      title: event.nom || '',
      venue: event.lieu || '',
      description: event.description || ''
    }
  })
})

const remerciementTitle = computed(() => {
  return data.value?.result?.ressources?.remerciement_title?.trim() || ''
})

const remerciementText = computed(() => {
  return data.value?.result?.ressources?.remerciement_text?.trim() || ''
})

const hasRemerciementSection = computed(() => {
  return Boolean(remerciementTitle.value || remerciementText.value)
})

const goToJournal = () => {
  const url = data.value?.result.ressources.journal_bouton_url
  if (url) {
    window.open(url, '_blank', 'noopener')
  }
}
</script>

<style lang="scss" scoped>
.ressources-remerciement_text {
  white-space: pre-line;
}
</style>
