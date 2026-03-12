<template>
  <div class="audioplayer" v-show="isVisible">
    <div class="audioplayer-wrapper">
      <img 
        :src="isPlaying ? '/images/son-pause.svg' : '/images/son-play.svg'" 
        loading="lazy" 
        alt="Play/Pause" 
        class="audioplayer_icon audioplayer_icon--play-toggle"
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
            alt=""
            class="audioplayer_track-icon"
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
            alt=""
            class="audioplayer_track-icon"
          >
        </button>
      </div>
      <img 
        :src="isMuted ? '/images/son-muted.svg' : '/images/Son-Player.svg'" 
        loading="lazy" 
        alt="Volume" 
        class="audioplayer_icon is-sound"
        @click="toggleMute"
      >
      <div class="audioplayer_line" @click="onProgressClick">
        <p class="audioplayer_name">
          {{ currentTrack?.type === 'lieu' && currentTrack?.num != null ? `${currentTrack.num}. ` : '' }}{{ currentTrack?.title }}
        </p>
        <div class="audioplayer_progression" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="audioplayer_time">{{ currentTimeFormatted }} / {{ durationFormatted }}</p>
      <img 
        src="/images/player-close.svg" 
        loading="lazy" 
        alt="Fermer" 
        class="audioplayer_icon audioplayer_icon--close"
        @click="close"
      >
    </div>
  </div>
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
  position: absolute;
  inset: -21px auto auto 0%;
  line-height: 1.2;
}

@media screen and (max-width: 767px) {
  .audioplayer_name {
    display: none;
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
</style>
