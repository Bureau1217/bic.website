<template>
  <main class="page">

    
    <section class="page_header">
      <AppBlocks :blocks="data?.result?.apropos?.titre" />
      <AppBlocks :blocks="data?.result?.apropos?.soustitre" />
    </section>  

    <section v-if="aproposSections.length" class="apropos_sections">
      <article
        v-for="section in aproposSections"
        :key="section.id"
        class="apropos_section"
      >
        <div class="apropos_section_title">
          <AppBlocks :blocks="section.titre" />
        </div>
        <div class="apropos_section_content">
          <div class="apropos_section_text">
            <AppBlocks :blocks="section.texte" />
          </div>
        </div>
      </article>
    </section>

    <ListePartenaires :partners="formattedPartenaires" />


  </main>
</template>




<script setup lang="ts">
type Partenaire = {
  nom: string
  paragraphe: string
  lien: string | null
  image: CMS_API_File[]
}

type FetchData = CMS_API_Response & {
  result: {
    apropos: {
      title: string
      slug: string
      titre: CMS_API_Block[]
      soustitre: CMS_API_Block[]
      bloc1_titre: CMS_API_Block[]
      bloc1_texte: CMS_API_Block[]
      bloc2_titre: CMS_API_Block[]
      bloc2_texte: CMS_API_Block[]
      layout: string | null
      address: string | null
      email: string | null
      phone: string | null
      partenaires: Partenaire[]
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
          titre: 'page.titre.toBlocks',
          soustitre: 'page.soustitre.toBlocks',
          bloc1_titre: 'page.bloc1_titre.toBlocks',
          bloc1_texte: 'page.bloc1_texte.toBlocks',
          bloc2_titre: 'page.bloc2_titre.toBlocks',
          bloc2_texte: 'page.bloc2_texte.toBlocks',
          layout: 'page.layout.toBlocks.toHtml',
          address: true,
          email: true,
          phone: true,
          partenaires: {
            query: 'page.partenaires.toStructure',
            select: {
              nom: true,
              paragraphe: true,
              lien: true,
              image: {
                query: 'structureItem.image.toFiles',
                select: {
                  url: true,
                  alt: true,
                },
              },
            },
          },
        },
      },
    },
  },
})

useHead(() => ({
  title: data.value?.result?.apropos?.title || 'A propos',
}))

// Formater les partenaires pour le composant ListePartenaires
const formattedPartenaires = computed(() => {
  if (!data.value?.result?.apropos?.partenaires) return []
  
  return data.value.result.apropos.partenaires.map((partenaire) => ({
    logo: partenaire.image?.[0]?.url || '',
    name: partenaire.nom,
    description: partenaire.paragraphe,
    link: partenaire.lien,
  }))
})

const aproposSections = computed(() => {
  const apropos = data.value?.result?.apropos
  if (!apropos) return []

  return [
    {
      id: 'bloc1',
      titre: apropos.bloc1_titre || [],
      texte: apropos.bloc1_texte || [],
    },
    {
      id: 'bloc2',
      titre: apropos.bloc2_titre || [],
      texte: apropos.bloc2_texte || [],
    },
  ].filter((section) => section.titre.length > 0 || section.texte.length > 0)
})
</script>

<style lang="scss" scoped>
.apropos_sections {
  width: 100%;
  padding: var(--40) 0;
  display: flex;
  flex-direction: column;
  gap: var(--40);
}

.apropos_section {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.apropos_section_title {
  width: 100%;
  padding: 0 var(--40);
}

.apropos_section_content {
  width: 100%;
  padding: var(--40) var(--40) 0;
  border-top: 1px solid var(--red);
}

.apropos_section_text {
  width: 60%;
  margin-left: auto;
}

@media screen and (max-width: 991px) {
  .apropos_section_title,
  .apropos_section_content {
    padding-right: var(--40);
    padding-left: var(--40);
  }

  .apropos_section_text {
    width: 100%;
    margin-left: 0;
  }
}

@media screen and (max-width: 479px) {
  .apropos_section_title,
  .apropos_section_content {
    padding-right: var(--10);
    padding-left: var(--10);
  }

  .apropos_section_content {
    padding-top: var(--20);
  }
}
</style>
