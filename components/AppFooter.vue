<template>
  <div class="footer">
    <div class="footer_info">
      <div v-if="contact?.address" class="footer_title" v-html="contact.address" />
      <a v-if="contact?.email" :href="'mailto:' + contact.email" class="footer_link">{{ contact.email }}</a>
      <a v-if="contact?.phone" :href="'tel:' + contact.phone" class="footer_link">{{ contact.phone }}</a>
    </div>
    <div class="footer_logo_wrapper">
      <img 
        v-for="(logo, index) in contact?.logos" 
        :key="index" 
        :src="logo.url" 
        loading="lazy" 
        :alt="logo.alt || ''" 
        class="footer_logo"
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
      logos: CMS_API_File[]
    }
  }
}

const { data } = await useFetch<FooterFetchData>('/api/CMS_KQLRequest', {
  lazy: true,
  method: 'POST',
  body: {
    query: 'site',
    select: {
      contact: {
        query: "site.find('a-propos')",
        select: {
          address: true,
          email: true,
          phone: true,
          logos: {
            query: 'page.logos.toFiles',
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

const contact = computed(() => data.value?.result?.contact)

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
  padding-top: 80px;
  padding-bottom: 40px;
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
