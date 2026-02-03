<template>
  <div class="global">
    <div class="menu">
      <NuxtLink to="/" class="menu_logo w-inline-block">
        <img src="/images/Logo-Notre-Historia.svg" loading="lazy" alt="" class="menu_logo_image">
      </NuxtLink>
      <div class="menu_nav">
        <div class="menu_icon" @click="toggleCatalogue">
          <img src="/images/Picto-Podcast-jaune.svg" loading="lazy" alt="">
        </div>
        <div class="menu_icon" @click="toggleMenu">
          <img src="/images/Menu.svg" loading="lazy" alt="">
        </div>
      </div>
      <div class="menu_offset" :style="{ display: menuOpen ? 'flex' : 'none' }">
        <div class="menu_close" @click="closeMenu"></div>
        <div class="menu_offset_wrapper">
          <div class="menu_cross_wrapper">
            <div class="menu_cross" @click="closeMenu">
              <div class="list_plus_line is-white"></div>
              <div class="list_plus_line is-vertical is-white"></div>
            </div>
          </div>
          <NuxtLink to="/parcours" class="menu_link w-inline-block" @click="closeMenu">
            <div>Parcours</div>
          </NuxtLink>
          <NuxtLink to="/#agenda" class="menu_link w-inline-block" @click="closeMenu">
            <div>Agenda</div>
          </NuxtLink>
          <NuxtLink to="/ressources" class="menu_link w-inline-block" @click="closeMenu">
            <div>Ressources</div>
          </NuxtLink>
          <div class="menu_parcours">
            <div class="menu_parcours_link is-triger" @click="toggleLieux">
              <div>Lieux</div>
              <div class="list_plus is-menu" :class="{ 'is-close': lieuxOpen }">
                <div class="list_plus_line is-white"></div>
                <div class="list_plus_line is-vertical is-white"></div>
              </div>
            </div>
            <div class="menu_parcours_link_wrapper" v-show="lieuxOpen">
              <slot name="lieux">
                <NuxtLink to="/parcours/1" class="menu_parcours_link w-inline-block" @click="closeMenu">
                  <div>1. Origine / langue</div>
                </NuxtLink>
                <NuxtLink to="/parcours/2" class="menu_parcours_link w-inline-block" @click="closeMenu">
                  <div>2. Origine / langue</div>
                </NuxtLink>
                <NuxtLink to="/parcours/3" class="menu_parcours_link w-inline-block" @click="closeMenu">
                  <div>3. Origine / langue</div>
                </NuxtLink>
                <NuxtLink to="/parcours/4" class="menu_parcours_link w-inline-block" @click="closeMenu">
                  <div>4. Origine / langue</div>
                </NuxtLink>
                <NuxtLink to="/parcours/5" class="menu_parcours_link w-inline-block" @click="closeMenu">
                  <div>5. Origine / langue</div>
                </NuxtLink>
              </slot>
            </div>
          </div>
          <NuxtLink to="/a-propos" class="menu_link w-inline-block" @click="closeMenu">
            <div>À propos</div>
          </NuxtLink>
        </div>
      </div>
      <div class="menu_catalogue" :style="{ display: catalogueOpen ? 'flex' : 'none' }">
        <div class="menu_close" @click="closeCatalogue"></div>
        <div class="menu_catalogue_wrapper">
          <div class="menu_catalogue_header">
            <div class="menu_catalogue_title_wrapper">
              <p class="menu_catalogue_title is-yellow">podcast notre historia</p>
              <p class="menu_catalogue_title">reportage 1 à 6</p>
            </div>
            <div class="menu_cross" @click="closeCatalogue">
              <div class="list_plus_line is-white"></div>
              <div class="list_plus_line is-vertical is-white"></div>
            </div>
          </div>
          <div class="menu_catalogue_list">
            <slot name="reportages">
              <!-- Placeholder for Episodes-->

            </slot>
          </div>
          <div class="menu_catalogue_title_wrapper">
            <p class="menu_catalogue_title">Lieux 1 à 12</p>
          </div>
          <div class="menu_catalogue_list">
            <slot name="capsules">
              <!-- Placeholder for Lieux -->

            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)
const catalogueOpen = ref(false)
const lieuxOpen = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) {
    catalogueOpen.value = false
  }
}

const closeMenu = () => {
  menuOpen.value = false
}

const toggleCatalogue = () => {
  catalogueOpen.value = !catalogueOpen.value
  if (catalogueOpen.value) {
    menuOpen.value = false
  }
}

const closeCatalogue = () => {
  catalogueOpen.value = false
}

const toggleLieux = () => {
  lieuxOpen.value = !lieuxOpen.value
}
</script>

<style lang="scss">
// Menu Component Styles
.menu {
  z-index: 900;
  width: var(--100);
  max-width: 2400px;
  display: flex;
  position: fixed;
  inset: 0% auto auto;
}

.menu_logo {
  background-color: var(--red);
  justify-content: center;
  align-items: center;
  width: 20%;
  margin-left: 20%;
  padding-left: 20px;
  padding-right: 20px;
  display: flex;
}

.menu_nav {
  grid-column-gap: var(--15);
  grid-row-gap: var(--15);
  background-color: var(--red);
  width: 10%;
  min-width: 135px;
  height: 60px;
  margin-left: auto;
  padding: 10px 20px;
  display: flex;
}

.menu_icon {
  height: var(--100);
  background-color: var(--red);
  width: 40px;
  cursor: pointer;
}

.menu_sound {
  background-color: var(--red);
  width: 50px;
  height: 50px;
}

.menu_offset {
  z-index: 900;
  text-transform: uppercase;
  flex-flow: row;
  width: 100%;
  display: none;
  position: fixed;
  inset: 0% 0% 0% auto;
}

.menu_catalogue {
  color: var(--white);
  flex-flow: row;
  width: 100%;
  height: 100vh;
  display: none;
  position: fixed;
  inset: 0% 0% auto auto;
  overflow: auto;
}

.menu_link {
  width: var(--100);
  padding: var(--10) var(--20);
  border-top: 1px solid var(--white);
  color: var(--white);
  text-transform: uppercase;
  font-size: 18px;
  text-decoration: none;
  transition: background-color .3s;

  &:hover {
    background-color: var(--green);
  }

  &.is-parcours {
    padding-right: var(--0);
    padding-left: var(--0);
  }
}

.menu_close {
  padding-top: var(--20);
  padding-bottom: var(--10);
  background-color: #00000080;
  justify-content: flex-end;
  align-items: center;
  width: 60%;
  height: 100vh;
  display: flex;
}

.menu_close_cross {
  width: var(--40);
  height: var(--40);
}

.menu_parcours_link {
  width: var(--100);
  padding: var(--10) var(--20);
  color: var(--white);
  text-decoration: none;
  transition: background-color .3s;

  &:hover {
    background-color: var(--green);
  }

  &.is-triger {
    justify-content: space-between;
    align-items: center;
    display: flex;
    position: relative;
  }
}

.menu_catalogue_header {
  width: var(--100);
  flex-flow: row;
  justify-content: space-between;
  align-items: flex-start;
  display: flex;
}

.menu_catalogue_title {
  margin-top: var(--10);
  text-transform: uppercase;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;

  &.is-yellow {
    margin-top: var(--0);
    margin-bottom: var(--10);
    color: var(--yellow);
  }
}

.menu_catalogue_title_wrapper {
  padding-bottom: var(--10);
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-start;
  display: flex;
}

.menu_catalogue_list {
  width: var(--100);
  grid-column-gap: var(--10);
  grid-row-gap: var(--10);
  flex-flow: wrap;
  grid-template-rows: auto auto;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-columns: 1fr;
  justify-content: flex-start;
  align-items: flex-start;
  display: grid;
}

.menu_offset_wrapper {
  background-color: var(--red);
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-end;
  width: 40%;
  height: 100vh;
  font-size: 18px;
  display: flex;
}

.menu_cross {
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  font-size: 21px;
  display: flex;
  transform: rotate(45deg);
  cursor: pointer;
}

.menu_parcours {
  border-top: 1px solid var(--white);
}

.menu_catalogue_wrapper {
  height: var(--100);
  padding: var(--10);
  background-color: var(--black);
  flex: none;
  width: 60%;
  overflow: auto;
}

.global {
  justify-content: center;
  align-items: flex-start;
  display: flex;
}

.menu_cross_wrapper {
  width: var(--100);
  padding-right: var(--20);
  justify-content: flex-end;
  align-items: center;
  height: 60px;
  display: flex;
}

// Media queries
@media screen and (max-width: 991px) {
  .menu {
    background-color: var(--red);
    justify-content: space-between;
    align-items: center;
    height: 60px;
  }

  .menu_logo {
    height: var(--100);
    width: auto;
    margin-left: 0%;
  }

  .menu_nav {
    margin-left: 0;
  }

  .menu_logo_image {
    height: 20px;
  }

  .menu_catalogue_list {
    flex-flow: column;
    display: flex;
  }

  .menu_offset_wrapper {
    width: 100%;
  }

  .menu_parcours {
    border-bottom: 1px solid var(--white);
  }

  .menu_catalogue_wrapper {
    width: var(--100);
  }

  .menu_close {
    display: none;
  }
}

@media screen and (max-width: 479px) {
  .menu_logo {
    padding-left: 10px;
    padding-right: 10px;
  }

  .menu_nav {
    justify-content: flex-end;
    align-items: center;
    width: auto;
    min-width: auto;
    padding-left: 10px;
    padding-right: 10px;
  }

  .menu_logo_image {
    height: 15px;
  }
}
</style>
