<template>
  <div class="footer">
    <div class="footer_info">
      <div v-if="contact?.address" class="footer_title" v-html="contact.address" />
      <a v-if="contact?.email" :href="'mailto:' + contact.email" class="footer_link">{{ contact.email }}</a>
      <a v-if="contact?.phone" :href="'tel:' + contact.phone" class="footer_link">{{ contact.phone }}</a>
      <a
        v-if="siteUrl"
        :href="siteUrl"
        class="footer_link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ siteUrlLabel }}
      </a>
      <a
        v-if="instagramUrl"
        :href="instagramUrl"
        class="footer_link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ instagramLabel }}
      </a>
    </div>
    <div class="footer_logo_wrapper">
      <img 
        v-for="(logo, index) in validLogos" 
        :key="index" 
        :src="logo.url" 
        loading="lazy" 
        decoding="async"
        :alt="logo.alt || ''" 
        class="footer_logo"
        :width="logo.width || 240"
        :height="logo.height || 120"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
type FooterFetchData = CMS_API_Response & {
  result: {
    contact: {
      address: string | null
      email: string | null
      phone: string | null
      site_url: string | null
      instagram: string | null
      logos: CMS_API_File[]
    }
  }
}

const { data } = await useFetch<FooterFetchData>('/api/CMS_KQLRequest', {
  method: 'POST',
  body: {
    query: 'site',
    select: {
      contact: {
        query: 'site',
        select: {
          address: true,
          email: true,
          phone: true,
          site_url: true,
          instagram: true,
          logos: {
            query: 'site.logos.toFiles',
            select: {
              url: true,
              alt: true,
              width: true,
              height: true,
            },
          },
        },
      },
    },
  },
})

const contact = computed(() => data.value?.result?.contact)
const validLogos = computed(() => (contact.value?.logos || []).filter((logo) => !!logo?.url))
const siteUrl = computed(() => contact.value?.site_url?.trim() || null)
const instagramUrl = computed(() => contact.value?.instagram?.trim() || null)
const siteUrlLabel = computed(() => {
  if (!siteUrl.value) return ''
  return siteUrl.value.replace(/^https?:\/\//, '').replace(/\/$/, '')
})

const instagramLabel = computed(() => {
  if (!instagramUrl.value) return ''
  try {
    const url = new URL(instagramUrl.value)
    const username = url.pathname.replace(/\//g, '')
    if (username) return `Instagram @${username}`
  } catch {
    // URL invalide: fallback sur la valeur brute nettoyee
  }
  return instagramUrl.value.replace(/^https?:\/\//, '').replace(/\/$/, '')
})

</script>

<style lang="scss">
// Footer Component Styles
.footer {
  width: var(--100);
  background-color: var(--red);
  justify-content: space-between;
  align-items: center;
  max-width: 2400px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 40px;
  padding-bottom: 20px;
  display: flex;
}

.footer_info {
  padding-right: var(--40);
  padding-left: var(--40);
  grid-column-gap: 5px;
  grid-row-gap: 5px;
  color: var(--white);
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 50%;
  display: flex;
}

.footer_logo_wrapper {
  padding-right: var(--40);
  grid-column-gap: var(--15);
  grid-row-gap: var(--15);
  grid-template-rows: auto;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-columns: 1fr;
  justify-content: space-between;
  align-items: center;
  width: 50%;
  height: 120px;
  padding-left: 40px;
  display: flex;
}

.footer_link {
  color: var(--white);
  font-size: var(--f-18);
  text-decoration: none;
}

.footer_title {
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 18px;
}

.footer_logo {
  width: var(--100);
  height: var(--100);
}

// Media queries
@media screen and (max-width: 991px) {
  .footer_logo_wrapper {
    height: 60px;
  }
}

@media screen and (max-width: 767px) {
  .footer {
    grid-column-gap: var(--40);
    grid-row-gap: var(--40);
    flex-flow: column;
  }

  .footer_info {
    width: var(--100);
    justify-content: flex-start;
    align-items: center;
  }

  .footer_logo_wrapper {
    width: var(--100);
  }

  .footer_link,
  .footer_title {
    text-align: center;
  }
}

@media screen and (max-width: 479px) {
  .footer_info {
    justify-content: flex-start;
    align-items: center;
    width: 100%;
  }

  .footer_title {
    text-align: center;
  }
}
</style>
