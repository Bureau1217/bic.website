<template>
  <div class="portrait">
    <div class="portrait_title_wrapper">
      <h1 class="portrait_title">{{ title }}</h1>
    </div>
    <div class="portrait_slider">
      <div 
        v-for="(portrait, index) in portraits" 
        :key="index" 
        class="portrait_card"
      >
        <img 
          :src="portrait.image" 
          loading="lazy" 
          :sizes="portrait.sizes || '(max-width: 2400px) 100vw, 2400px'" 
          :srcset="portrait.srcset" 
          :alt="portrait.alt || ''" 
          class="portrait_card_image"
        >
        <div class="portrait_card_info">
          <p class="portrait_name">{{ portrait.name }}</p>
          <p class="portrait_description">{{ portrait.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Portraits'
  },
  portraits: {
    type: Array,
    default: () => []
  }
})
</script>

<style lang="scss">
// Portrait Slider Component Styles
.portrait {
  width: var(--100);
  background-color: var(--red);
  display: flex;
}

.portrait_card {
  width: 100%;
}

.portrait_card_info {
  padding: var(--40) var(--10) var(--20);
  background-color: var(--green);
}

.portrait_card_image {
  width: var(--100);
  object-fit: cover;
  height: 20vw;
}

.portrait_title_wrapper {
  padding-top: var(--40);
  padding-right: var(--40);
  padding-left: var(--40);
  width: 40%;
}

.portrait_title {
  color: var(--white);
}

.portrait_name {
  color: var(--yellow);
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
}

.portrait_description {
  color: var(--white);
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 16px;
}

.portrait_slider {
  width: 60%;
  display: flex;
}

// Media queries
@media screen and (max-width: 991px) {
  .portrait {
    flex-flow: column;
  }

  .portrait_card_image {
    height: 33.33vw;
  }

  .portrait_title_wrapper {
    width: var(--100);
  }

  .portrait_slider {
    width: 100%;
  }
}

@media screen and (max-width: 479px) {
  .portrait_title_wrapper {
    padding-right: var(--10);
    padding-left: var(--10);
  }
}
</style>
