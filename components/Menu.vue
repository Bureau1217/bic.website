<template>
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
              <NuxtLink 
                v-for="lieu in lieux" 
                :key="lieu.slug"
                :to="`/parcours/${lieu.slug}`" 
                class="menu_parcours_link w-inline-block" 
                @click="closeMenu"
              >
                <div>{{ lieu.num }}. {{ lieu.title }}</div>
              </NuxtLink>
            </div>
          </div>
          <NuxtLink to="/a-propos" class="menu_link is-last" @click="closeMenu">
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
            <!-- Episodes / Reportages -->
            <div
              v-for="episode in episodes"
              :key="episode.slug"
              class="audio-card--menu"
              @click="playEpisode(episode)"
            >
              <div class="audio-card_image_wrapper" v-if="episode.imagepodcast">
                <img class="audio-card_image" :src="episode.imagepodcast.url" :alt="episode.imagepodcast.alt || episode.title" />
                <div class="audio-card_button">
                  <img class="image" src="/images/Picto-Podcast-jaune.svg" loading="lazy" alt="">
                  <p class="audio-card_duration" v-if="audioDurations[episode.slug]">{{ audioDurations[episode.slug] }}</p>
                </div>
              </div>
              <div class="audio-card_info is-bg-red">
                <!--<p class="number">{{ episode.num }}.</p>-->
                <p class="audio-card_title">{{ episode.title }}</p>
              </div>
            </div>
          </div>
          <div class="menu_catalogue_title_wrapper">
            <p class="menu_catalogue_title">Lieux 1 à {{ lieux.length }}</p>
          </div>
          <div class="menu_catalogue_list">
            <!-- Lieux / Capsules -->
            <div
              v-for="lieu in lieux"
              :key="lieu.slug"
              class="audio-card--menu"
              @click="playLieu(lieu)"
            >
              <div class="audio-card_image_wrapper" v-if="lieu.imagepodcast">
                <img class="audio-card_image" :src="lieu.imagepodcast.url" :alt="lieu.imagepodcast.alt || lieu.title" />
                <div class="audio-card_button">
                  <img class="image" src="/images/Picto-Podcast-jaune.svg" loading="lazy" alt="">
                  <p class="audio-card_duration" v-if="audioDurations[lieu.slug]">{{ audioDurations[lieu.slug] }}</p>
                </div>
              </div>
              <div class="audio-card_info is-bg-green">
                <!--<p class="number">{{ lieu.num }}.</p>-->
                <p class="audio-card_title"><span class="audio-card_number">{{ lieu.num }}.</span> {{ lieu.title }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

// Utiliser le composable pour accéder aux données globales
const { lieux, episodes, isLoaded } = usePodcastData()

// Lecteur audio global
const { playTrack } = useAudioPlayer()

const menuOpen = ref(false)
const catalogueOpen = ref(false)
const lieuxOpen = ref(false)

// --- Durées audio ---
// Map slug -> durée formatée (ex: "12'34")
const audioDurations = ref<Record<string, string>>({})

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}'${secs.toString().padStart(2, '0')}`
}

const loadAudioDuration = (slug: string, url: string) => {
  if (audioDurations.value[slug]) return // déjà chargé
  const audio = new Audio()
  audio.preload = 'metadata'
  audio.addEventListener('loadedmetadata', () => {
    if (audio.duration && isFinite(audio.duration)) {
      audioDurations.value[slug] = formatDuration(audio.duration)
    }
  })
  audio.src = url
}

const loadAllDurations = () => {
  for (const episode of episodes.value) {
    if (episode.audio?.url) {
      loadAudioDuration(episode.slug, episode.audio.url)
    }
  }
  for (const lieu of lieux.value) {
    if (lieu.audio?.url) {
      loadAudioDuration(lieu.slug, lieu.audio.url)
    }
  }
}

// Charger les durées quand les données sont prêtes
onMounted(() => {
  if (isLoaded.value) {
    loadAllDurations()
  }
})

watch(isLoaded, (loaded) => {
  if (loaded) {
    loadAllDurations()
  }
})

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

// Lancer l'audio d'un épisode
const playEpisode = (episode: any) => {
  if (episode.audio?.url) {
    playTrack({
      title: episode.title,
      num: episode.num,
      audioUrl: episode.audio.url,
      slug: episode.slug,
      type: 'episode',
    })
  }
  closeCatalogue()
}

// Lancer l'audio d'un lieu
const playLieu = (lieu: any) => {
  if (lieu.audio?.url) {
    playTrack({
      title: lieu.title,
      num: lieu.num,
      audioUrl: lieu.audio.url,
      slug: lieu.slug,
      type: 'lieu',
    })
  }
  closeCatalogue()
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

  &.is-last {
    border-bottom: 1px solid var(--white);
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

.menu_catalogue_item {
  text-decoration: none;
  color: var(--white);
  cursor: pointer;
  transition: opacity 0.3s;
  
  &:hover {
    opacity: 0.8;
  }
}

.menu_catalogue_item_image {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  margin-bottom: var(--5);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.menu_catalogue_item_title {
  font-size: 12px;
  text-transform: uppercase;
}

.menu_catalogue_item_duration {
  font-size: 11px;
  color: var(--yellow);
  margin-top: 2px;
}

.audio-card_duration {
  font-size: 11px;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  color: var(--yellow);
  margin: 0;
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
  width: 100%;
  cursor: pointer;
}

.menu_catalogue_wrapper {
  height: var(--100);
  padding: var(--10);
  background-color: var(--black);
  flex: none;
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
    grid-template-columns: 1fr 1fr;
  }

  .menu_offset_wrapper {
    width: 100%;
  }

  .menu_catalogue_wrapper {
    width: var(--100);
  }

  .menu_close {
    display: none;
  }
}

@media screen and (max-width: 479px) {
  .menu_catalogue_list {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: var(--10);
  }

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
