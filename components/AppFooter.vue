<template>
  <div class="footer">
    <div class="footer_info">
      <p class="footer_title">{{ title }}</p>
      <a :href="'mailto:' + email" class="footer_link">{{ email }}</a>
      <a :href="'tel:' + phone" class="footer_link">{{ phone }}</a>
    </div>
    <div class="footer_logo_wrapper">
      <img 
        v-for="(logo, index) in logos" 
        :key="index" 
        :src="logo.src" 
        loading="lazy" 
        :alt="logo.alt || ''" 
        class="footer_logo"
      >
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Département de la cohésion sociale (DCS)'
  },
  email: {
    type: String,
    default: 'secreteriat.dcs@etat.ge.ch'
  },
  phone: {
    type: String,
    default: '+241 22 327 93 10'
  },
  logos: {
    type: Array,
    default: () => [
      { src: '/images/Logo-Ville-de-Genève.svg', alt: 'Ville de Genève' },
      { src: '/images/Logo-CantonGE.svg', alt: 'Canton de Genève' },
      { src: '/images/Logo-PIC.svg', alt: 'PIC' }
    ]
  }
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
