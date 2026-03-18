<template>
  <Transition name="audioplayer-reveal">
    <div class="audioplayer" v-show="isVisible">
      <div class="audioplayer-wrapper">
      <img 
        :src="isPlaying ? '/images/son-pause.svg' : '/images/son-play.svg'" 
        loading="lazy" 
        decoding="async"
        alt="Play/Pause" 
        class="audioplayer_icon audioplayer_icon--play-toggle"
        width="30"
        height="30"
        @click="togglePlay"
      >
      <div class="audioplayer_track-controls">
        <button
          type="button"
          class="audioplayer_track-button"
          aria-label="Piste précédente"
          @click="playPrevious"
        >
          <img
            src="/images/prev.svg"
            loading="lazy"
            decoding="async"
            alt=""
            class="audioplayer_track-icon"
            width="30"
            height="30"
          >
        </button>
        <button
          type="button"
          class="audioplayer_track-button"
          aria-label="Piste suivante"
          @click="playNext"
        >
          <img
            src="/images/next.svg"
            loading="lazy"
            decoding="async"
            alt=""
            class="audioplayer_track-icon"
            width="30"
            height="30"
          >
        </button>
      </div>
      <img 
        :src="isMuted ? '/images/son-muted.svg' : '/images/Son-Player.svg'" 
        loading="lazy" 
        decoding="async"
        alt="Volume" 
        class="audioplayer_icon is-sound"
        width="30"
        height="30"
        @click="toggleMute"
      >
      <div class="audioplayer_line" @click="onProgressClick">
        <div class="audioplayer_name-marquee" ref="nameMarqueeRef">
          <div
            class="audioplayer_name-track"
            ref="nameTrackRef"
            :class="{ 'is-animated': shouldAnimateName }"
            :style="nameMarqueeStyle"
          >
            <p class="audioplayer_name">
              {{ currentTrack?.type === 'lieu' && currentTrack?.num != null ? `${currentTrack.num}. ` : '' }}{{ currentTrack?.title }}
            </p>
          </div>
        </div>
        <div class="audioplayer_progression" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="audioplayer_time">{{ currentTimeFormatted }} / {{ durationFormatted }}</p>
      <img 
        src="/images/player-close.svg" 
        loading="lazy" 
        decoding="async"
        alt="Fermer" 
        class="audioplayer_icon audioplayer_icon--close"
        width="30"
        height="30"
        @click="close"
      >
      </div>
    </div>
  </Transition>
</template>

<script setup>
const {
  isPlaying,
  isMuted,
  isVisible,
  currentTrack,
  currentTime,
  duration,
  progress,
  currentTimeFormatted,
  durationFormatted,
  togglePlay,
  playNext,
  playPrevious,
  toggleMute,
  close,
  seekTo,
} = useAudioPlayer()

const onProgressClick = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const percent = ((event.clientX - rect.left) / rect.width) * 100
  seekTo(percent)
}

const TABLET_MEDIA_QUERY = '(max-width: 991px)'

const nameMarqueeRef = ref(null)
const nameTrackRef = ref(null)
const shouldAnimateName = ref(false)
const nameMarqueeStyle = ref({})
const isTabletViewport = ref(false)

let mediaQueryList = null
let resizeObserver = null

const getCurrentTrackTitle = () =>
  currentTrack?.value?.title ?? currentTrack?.title ?? ''

const refreshNameAnimation = () => {
  if (!process.client) return

  const marqueeEl = nameMarqueeRef.value
  const trackEl = nameTrackRef.value

  if (!marqueeEl || !trackEl) {
    shouldAnimateName.value = false
    nameMarqueeStyle.value = {}
    return
  }

  const containerWidth = marqueeEl.clientWidth
  const textWidth = trackEl.scrollWidth
  const doesOverflow = textWidth > containerWidth

  shouldAnimateName.value = isTabletViewport.value && doesOverflow

  if (!shouldAnimateName.value) {
    nameMarqueeStyle.value = {}
    return
  }

  const travelDistance = containerWidth + textWidth
  const speedPxPerSecond = 35
  const duration = Math.max(travelDistance / speedPxPerSecond, 8)

  nameMarqueeStyle.value = {
    '--marquee-start': `${containerWidth}px`,
    '--marquee-end': `${-textWidth}px`,
    '--marquee-duration': `${duration}s`,
  }
}

const handleViewportChange = (event) => {
  isTabletViewport.value = event.matches
  refreshNameAnimation()
}

onMounted(() => {
  mediaQueryList = window.matchMedia(TABLET_MEDIA_QUERY)
  isTabletViewport.value = mediaQueryList.matches

  if (mediaQueryList.addEventListener) {
    mediaQueryList.addEventListener('change', handleViewportChange)
  } else {
    mediaQueryList.addListener(handleViewportChange)
  }

  resizeObserver = new ResizeObserver(() => {
    refreshNameAnimation()
  })

  if (nameMarqueeRef.value) resizeObserver.observe(nameMarqueeRef.value)
  if (nameTrackRef.value) resizeObserver.observe(nameTrackRef.value)

  nextTick(() => {
    refreshNameAnimation()
  })
})

onBeforeUnmount(() => {
  if (mediaQueryList) {
    if (mediaQueryList.removeEventListener) {
      mediaQueryList.removeEventListener('change', handleViewportChange)
    } else {
      mediaQueryList.removeListener(handleViewportChange)
    }
  }

  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(getCurrentTrackTitle, () => {
  nextTick(() => {
    refreshNameAnimation()
  })
})
</script>

<style lang="scss" scoped>

.audioplayer {
  top: auto;
  left: 0%;
  right: 0%;
  bottom: var(--10);
  width: var(--100);
  padding-right: var(--40);
  padding-left: var(--40);
  justify-content: center;
  align-items: center;
  display: flex;
  position: fixed;
  z-index: 9999;
}

.audioplayer-reveal-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.audioplayer-reveal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.audioplayer-reveal-enter-from,
.audioplayer-reveal-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.audioplayer-wrapper {
  width: var(--100);
  padding: 5px var(--10);
  grid-column-gap: var(--10);
  grid-row-gap: var(--10);
  background-color: #00000080;
  border-radius: 100px;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  height: 50px;
  display: flex;
}

.audioplayer_icon {
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.audioplayer_track-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.audioplayer_track-button {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.audioplayer_track-icon {
  width: 30px;
  height: 30px;
  display: block;
  opacity: 1;
  transition: opacity 0.25s ease;
}

.audioplayer_track-button:hover {
  background: #00000040;
}

.audioplayer_track-button:hover .audioplayer_track-icon,
.audioplayer_track-button:focus-visible .audioplayer_track-icon {
  opacity: 0.7;
}

.audioplayer_icon--play-toggle {
  opacity: 1;
  transition: opacity 0.25s ease;
}

.audioplayer_icon--play-toggle:hover {
  opacity: 0.7;
}

.audioplayer_icon--close {
  opacity: 1;
  transition: opacity 0.25s ease;
}

.audioplayer_icon--close:hover {
  opacity: 0.7;
}

.audioplayer_icon.is-sound {
  width: 30px;
  height: 30px;
}

.audioplayer_time {
  color: var(--yellow);
  flex: none;
  justify-content: flex-start;
  align-items: center;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 10px;
  display: flex;
}

.audioplayer_line {
  width: var(--100);
  height: 1px;
  flex-flow: column;
  justify-content: center;
  align-items: flex-start;
  display: flex;
  position: relative;
  cursor: pointer;
  background-color: var(--yellow);
}

.audioplayer_progression {
  width: var(--100);
  background-color: var(--yellow);
  height: 4px;
  flex-shrink: 0;
}

.audioplayer_name {
  color: var(--yellow);
  flex: none;
  justify-content: flex-start;
  align-items: center;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
  display: flex;
  position: static;
  line-height: 1.2;
  white-space: nowrap;
}

.audioplayer_name-marquee {
  position: absolute;
  inset: -21px auto auto 0%;
  max-width: 100%;
  pointer-events: none;
}

.audioplayer_name-track {
  display: inline-flex;
  align-items: center;
  transform: translateX(0);
}

@media screen and (max-width: 767px) {
  
}

@media screen and (max-width: 991px) {
  .audioplayer_name-marquee {
    width: 100%;
    overflow: hidden;
  }

  .audioplayer_name-track {
    width: max-content;
    min-width: fit-content;
  }

  .audioplayer_name-track.is-animated {
    animation: audioplayer-marquee var(--marquee-duration, 12s) linear infinite;
    will-change: transform;
  }
}

@media screen and (max-width: 479px) {

  .audioplayer-wrapper {
    grid-column-gap: var(--10);
    grid-row-gap: var(--10);
  }

  .audioplayer {
    padding-right: var(--10);
    padding-left: var(--10);
  }
}

@keyframes audioplayer-marquee {
  0% {
    transform: translateX(var(--marquee-start, 0px));
  }
  100% {
    transform: translateX(var(--marquee-end, 0px));
  }
}
</style>
