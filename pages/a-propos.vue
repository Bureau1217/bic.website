<template>
  <main class="page">

    
    <section class="page_header">
      <AppBlocks :blocks="data?.result?.apropos?.titre" />
      <AppBlocks :blocks="data?.result?.apropos?.soustitre" />
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
</script>
