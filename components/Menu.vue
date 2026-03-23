<template>
    <div class="menu">
      <NuxtLink to="/" :prefetch="false" class="menu_logo" :class="{ 'is-hidden': !isLogoVisible }">
        <img
          src="/images/Logo-Notre-Historia.svg"
          loading="eager"
          decoding="async"
          alt="Notre Historia"
          class="menu_logo_image"
          width="468"
          height="44"
        >
      </NuxtLink>
      <div class="menu_nav">
        <div class="menu_icon menu_icon--podcast" @click="toggleCatalogue">
          <svg class="menu_icon_svg menu_icon_svg--podcast" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 69.32 69.32" aria-hidden="true">
            <path class="menu_icon_svg_podcast_bg" d="M34.66,0C15.55,0,0,15.55,0,34.66s15.55,34.66,34.66,34.66,34.66-15.55,34.66-34.66S53.77,0,34.66,0Z"/>
            <g>
              <rect class="menu_icon_svg_podcast_bars" x="41.86" y="21.01" width="5.11" height="27.3"/>
              <rect class="menu_icon_svg_podcast_bars" x="51.73" y="26.12" width="5.11" height="17.09"/>
              <rect class="menu_icon_svg_podcast_bars" x="22.35" y="21.01" width="5.11" height="27.3"/>
              <rect class="menu_icon_svg_podcast_bars" x="12.49" y="26.12" width="5.11" height="17.09"/>
              <rect class="menu_icon_svg_podcast_bars" x="32.18" y="13.02" width="5.11" height="43.27"/>
            </g>
          </svg>
        </div>
        <div class="menu_icon menu_icon--menu" @click="toggleMenu">
          <svg class="menu_icon_svg menu_icon_svg--menu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54.33 54.33" aria-hidden="true">
            <path d="M27.16,54.33C12.19,54.33,0,42.14,0,27.16S12.19,0,27.16,0s27.16,12.19,27.16,27.16-12.19,27.16-27.16,27.16ZM27.16,2.5C13.56,2.5,2.5,13.56,2.5,27.16s11.06,24.66,24.66,24.66,24.66-11.06,24.66-24.66S40.76,2.5,27.16,2.5Z"/>
            <g>
              <rect x="10.97" y="18.19" width="32.38" height="2.5"/>
              <rect x="10.97" y="25.88" width="32.38" height="2.5"/>
              <rect x="10.97" y="33.64" width="32.38" height="2.5"/>
            </g>
          </svg>
        </div>
      </div>
      <div class="menu_offset" :class="{ 'is-open': menuOpen }">
        <div class="menu_close" @click="closeMenu"></div>
        <div class="menu_offset_wrapper">
          <div class="menu_cross_wrapper">
            <div class="menu_cross" @click="closeMenu">
              <div class="list_plus_line is-white"></div>
              <div class="list_plus_line is-vertical is-white"></div>
            </div>
          </div>
          <NuxtLink
            to="/parcours"
            :prefetch="false"
            :class="['menu_link', { 'is-active': isActiveStaticPage('/parcours') }]"
            @click="closeMenu"
          >
            <div>Parcours</div>
          </NuxtLink>
          <NuxtLink
            to="/ressources"
            :prefetch="false"
            :class="['menu_link', { 'is-active': isActiveStaticPage('/ressources') }]"
            @click="closeMenu"
          >
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
                v-for="(lieu, lieuIndex) in lieux"
                :key="lieu.slug"
                :to="`/parcours/${lieu.slug}`"
                :prefetch="false"
                :class="['menu_parcours_link', { 'is-active': isActiveLieuPage(lieu.slug) }]"
                @click="closeMenu"
              >
                <div class="menu_parcours_link_title"><span>{{ lieuIndex + 1 }}.</span> <span>{{ lieu.title }}</span></div>
              </NuxtLink>
            </div>
          </div>
          <NuxtLink
            to="/a-propos"
            :prefetch="false"
            :class="['menu_link', 'is-last', { 'is-active': isActiveStaticPage('/a-propos') }]"
            @click="closeMenu"
          >
            <div>À propos</div>
          </NuxtLink>
          <div class="menu_offset_legals">
            <NuxtLink to="/mentions-legales" :prefetch="false" class="menu_link--legals" @click="closeMenu">Mentions légales</NuxtLink>
            <NuxtLink to="/protection-des-donnees" :prefetch="false" class="menu_link--legals" @click="closeMenu">Protection des données</NuxtLink>
          </div>

        </div>
      </div>
      <div class="menu_catalogue" :class="{ 'is-open': catalogueOpen }">
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
            <AudioCard
              v-for="episode in episodes"
              :key="episode.slug"
              variant="menu-episode"
              :track-audio-url="episode.audio?.url || ''"
              :duration="audioDurations[episode.slug]"
              :title="episode.title"
              :description="episode.texte || ''"
              @play="playEpisode(episode)"
            >
              <template #image>
                <ResponsivePicture v-if="episode.imagepodcast" class="audio-card_image" :image="episode.imagepodcast" sizes="200px" :alt="episode.title" picture-class="audio-card_image_rp" />
              </template>
            </AudioCard>
          </div>
          <div class="menu_catalogue_title_wrapper">
            <p class="menu_catalogue_title">Lieux 1 à {{ lieux.length }}</p>
          </div>
          <div class="menu_catalogue_list">
            <!-- Lieux / Capsules -->
            <AudioCard
              v-for="(lieu, lieuIndex) in lieux"
              :key="lieu.slug"
              variant="menu-catalogue"
              :track-audio-url="lieu.audio?.url || ''"
              :duration="audioDurations[lieu.slug]"
              @play="playLieu(lieu)"
            >
              <template #image>
                <ResponsivePicture v-if="lieu.imagepodcast" class="audio-card_image" :image="lieu.imagepodcast" sizes="200px" :alt="lieu.title" picture-class="audio-card_image_rp" />
              </template>
              <template #info>
                <p class="audio-card_title"><span class="audio-card_number">{{ lieuIndex + 1 }}.  </span> {{ lieu.title }}</p>
              </template>
            </AudioCard>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Utiliser le composable pour accéder aux données globales
const { lieux, episodes, isLoaded, fetchPodcastData } = usePodcastData()

// Lecteur audio global
const { playTrack } = useAudioPlayer()
const route = useRoute()

const menuOpen = ref(false)
const catalogueOpen = ref(false)
const lieuxOpen = ref(false)
const isLogoVisible = ref(false)
const lastScrollY = ref(0)
const audioDurationsLoaded = ref(false)

const SCROLL_DIRECTION_THRESHOLD = 6
const TABLET_MAX_WIDTH = 991
const TOP_SCROLL_TOLERANCE_PX = 8

const isHomePage = (path: string): boolean => {
  return path === '/'
}

const isTabletAndDown = (): boolean => {
  return window.matchMedia(`(max-width: ${TABLET_MAX_WIDTH}px)`).matches
}

const isParcoursPage = (path: string): boolean => {
  const normalizedPath = normalizePath(path)
  return normalizedPath === '/parcours' || normalizedPath.startsWith('/parcours/')
}

const isTopVisibleLogoPage = (path: string): boolean => {
  const normalizedPath = normalizePath(path)
  return normalizedPath === '/a-propos'
    || normalizedPath === '/ressources'
    || normalizedPath === '/ressource'
    || normalizedPath === '/mentions-legales'
    || normalizedPath === '/protection-des-donnees'
    || isParcoursPage(normalizedPath)
}

const shouldKeepLogoVisible = (path: string): boolean => {
  return isParcoursPage(path) && isTabletAndDown()
}

const normalizePath = (path: string): string => {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1)
  }
  return path
}

const isActiveStaticPage = (targetPath: string): boolean => {
  return normalizePath(route.path) === normalizePath(targetPath)
}

const isActiveLieuPage = (slug: string): boolean => {
  return normalizePath(route.path) === normalizePath(`/parcours/${slug}`)
}

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
  if (audioDurationsLoaded.value) return
  audioDurationsLoaded.value = true

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

const ensurePodcastDataLoaded = async () => {
  if (!isLoaded.value) {
    await fetchPodcastData()
  }
}

const handleWindowScroll = () => {
  const currentScrollY = Math.max(0, window.scrollY || 0)
  const currentPath = route.path

  // Sécurité: si on arrive tout en haut, on évite les micro-bugs de scroll
  // (bounce/scroll très chaotique) qui peuvent laisser le logo en "hidden".
  if (currentScrollY <= TOP_SCROLL_TOLERANCE_PX) {
    isLogoVisible.value = isTopVisibleLogoPage(currentPath) || shouldKeepLogoVisible(currentPath)
    lastScrollY.value = currentScrollY
    return
  }

  const delta = currentScrollY - lastScrollY.value

  // Sur la home uniquement, le logo doit se cacher au retour en haut de page.
  if (isHomePage(currentPath) && currentScrollY <= 0) {
    isLogoVisible.value = false
    lastScrollY.value = currentScrollY
    return
  }

  // Ignore micro-movements to avoid flickering.
  if (Math.abs(delta) < SCROLL_DIRECTION_THRESHOLD) return

  isLogoVisible.value = delta < 0
  lastScrollY.value = currentScrollY
}

const syncLogoVisibility = (path: string) => {
  isLogoVisible.value = isTopVisibleLogoPage(path)
}

const handleWindowResize = () => {
  syncLogoVisibility(route.path)
  lastScrollY.value = Math.max(0, window.scrollY || 0)
}

// Charger les durées quand les données sont prêtes
onMounted(() => {
  syncLogoVisibility(route.path)
  lastScrollY.value = Math.max(0, window.scrollY || 0)
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
  window.addEventListener('resize', handleWindowResize, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleWindowScroll)
  window.removeEventListener('resize', handleWindowResize)
})

watch([catalogueOpen, isLoaded], ([isCatalogueOpen, loaded]) => {
  if (isCatalogueOpen && loaded) {
    loadAllDurations()
  }
}, { immediate: true })

watch(() => route.path, (path) => {
  syncLogoVisibility(path)
  lastScrollY.value = Math.max(0, window.scrollY || 0)
})

const toggleMenu = () => {
  void ensurePodcastDataLoaded()
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) {
    catalogueOpen.value = false
  }
}

const closeMenu = () => {
  menuOpen.value = false
}

const toggleCatalogue = () => {
  void ensurePodcastDataLoaded()
  catalogueOpen.value = !catalogueOpen.value
  if (catalogueOpen.value) {
    menuOpen.value = false
  }
}

const closeCatalogue = () => {
  catalogueOpen.value = false
}

const toggleLieux = () => {
  void ensurePodcastDataLoaded()
  lieuxOpen.value = !lieuxOpen.value
}

// Lancer l'audio d'un épisode
const playEpisode = (episode: any) => {
  if (episode.audio?.url) {
    playTrack({
      title: episode.title,
      subtitle: episode.texte,
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
  position: relative;
  transition: transform 0.4s ease 0.3s;

  &.is-hidden {
    transform: translateY(-60px);
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu_icon_svg {
  display: block;
  width: 100%;
  height: 100%;
}

.menu_icon_svg--podcast {
  width: 40px;
  height: 40px;
}

.menu_icon_svg_podcast_bg {
  fill: var(--yellow);
  transition: fill 0.25s ease;
}

.menu_icon_svg_podcast_bars {
  fill: var(--black);
  transition: fill 0.25s ease;
}

.menu_icon_svg--menu {
  width: 40px;
  height: 40px;
  color: var(--white);
  opacity: 1;
  transition: color 0.25s ease, opacity 0.25s ease;
}

.menu_icon_svg--menu path,
.menu_icon_svg--menu rect {
  fill: currentColor;
}

.menu_icon--menu:hover .menu_icon_svg--menu {
  color: var(--yellow);
  opacity: 0.7;
}

.menu_icon--podcast:hover .menu_icon_svg_podcast_bg {
  fill: var(--white);
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
  display: flex;
  position: fixed;
  inset: 0% 0% 0% auto;
  transform: translateX(0);
  opacity: 0;
  transition: opacity 0.5s ease-in-out, visibility 0.5s;
  pointer-events: none;
  visibility: hidden;

  &.is-open {
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
  }
}

.menu_catalogue {
  color: var(--white);
  flex-flow: row;
  width: 100%;
  height: 100vh;
  display: flex;
  position: fixed;
  inset: 0% 0% auto auto;
  overflow: auto;
  transform: translateX(0);
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
  visibility: hidden;

  &.is-open {
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
  }
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

  &.is-active {
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

.menu_offset_legals {
  display: flex;
  flex-flow: column;
  gap: 5px;
  width: var(--100);
  padding: var(--20) var(--20);
  color: var(--white);
  font-size: 14px;
  text-decoration: none;
  text-transform: none;
  margin-top: auto;
}
.menu_link--legals {
  color: var(--white);
  text-decoration: none;
}

.menu_close {
  padding-top: var(--20);
  padding-bottom: var(--10);
  background-color: #00000080;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 100vh;
  display: flex;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s ease-in-out;
}

.menu_offset.is-open .menu_close,
.menu_catalogue.is-open .menu_close {
  opacity: 1;
  pointer-events: auto;
}

.menu_close_cross {
  width: var(--40);
  height: var(--40);
}

.menu_parcours_link {
  display: block;
  width: var(--100);
  padding: var(--10) var(--20);
  color: var(--white);
  text-decoration: none;
  transition: background-color .3s;
  line-height: 1.2;

  &:hover {
    background-color: var(--green);
  }

  &.is-active {
    background-color: var(--green);
  }

  &.is-triger {
    justify-content: space-between;
    align-items: center;
    display: flex;
    position: relative;
  }
}

.menu_parcours_link_title {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  gap: var(--10);
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

.menu_offset_wrapper {
  background-color: var(--red);
  flex-flow: column;
  justify-content: flex-start;
  align-items: flex-end;
  width: 40%;
  height: 100vh;
  font-size: 18px;
  display: flex;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.menu_offset_wrapper > * {
  flex-shrink: 0;
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
  opacity: 1;
  transition: opacity 0.25s ease;
}

.menu_cross:hover {
  opacity: 0.7;
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
    justify-content: space-between;
    align-items: center;
    height: 60px;
  }

  .menu_parcours_link:hover {
    background-color: transparent;
}

  .menu_logo {
    height: var(--100);
    width: var(--100);
    margin-left: 0%;
    justify-content: flex-start;
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

  .menu_offset_legals {
    padding: var(--20) var(--20) 200px;
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

}
</style>
