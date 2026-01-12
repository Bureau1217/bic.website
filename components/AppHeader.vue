<template>
  <header class="v-header">

  <div class="v-header__top">
  <NuxtLink to="/" class="v-header__logo">
    <img src="/img/bic_logo.svg" alt="BIC" />
  </NuxtLink>

      <div class="v-header__menu" @click="toggleMenu">
        MENU
      </div>
    </div>

    <nav class="v-header__nav" :class="{ 'is-visible': showMenu }">
      <ul>
        <li><NuxtLink to="/ressources">RESSOURCES</NuxtLink></li>
        <li><NuxtLink to="/reportage">REPORTAGE</NuxtLink></li>
        <li><NuxtLink to="/parcours">PARCOURS</NuxtLink></li>
        <li><NuxtLink to="/a-propos">À PROPOS</NuxtLink></li>
        <li><NuxtLink to="/mentions-legales">MENTIONS LÉGALES</NuxtLink></li>
        <li><NuxtLink to="/protection-des-donnees">PROTECTION DES DONNÉES</NuxtLink></li>
        <li><NuxtLink to="/engagement">ENGAGEMENT</NuxtLink></li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showMenu = ref(false)

function toggleMenu() {
  showMenu.value = !showMenu.value
}
</script>
