<template>
  <div class="audioplayer" v-show="isVisible">
    <div class="audioplayer-wrapper">
      <img 
        :src="isPlaying ? '/images/son-pause.svg' : '/images/son-play.svg'" 
        loading="lazy" 
        alt="Play/Pause" 
        class="audioplayer_icon"
        @click="togglePlay"
      >
      <img 
        :src="isMuted ? '/images/son-muted.svg' : '/images/Son-Player.svg'" 
        loading="lazy" 
        alt="Volume" 
        class="audioplayer_icon is-sound"
        @click="toggleMute"
      >
      <div class="audioplayer_line" @click="onProgressClick">
        <p class="audioplayer_name">{{ currentTrack?.title }}</p>
        <div class="audioplayer_progression" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="audioplayer_time">{{ currentTimeFormatted }} / {{ durationFormatted }}</p>
      <img 
        src="/images/player-close.svg" 
        loading="lazy" 
        alt="Fermer" 
        class="audioplayer_icon"
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
  grid-column-gap: var(--20);
  grid-row-gap: var(--20);
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
  height: var(--100);
  flex-flow: column;
  justify-content: center;
  align-items: flex-start;
  display: flex;
  position: relative;
}

.audioplayer_progression {
  width: var(--100);
  background-color: var(--yellow);
  height: 2px;
}

.audioplayer_name {
  color: var(--yellow);
  flex: none;
  justify-content: flex-start;
  align-items: center;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 10px;
  display: flex;
  position: absolute;
  inset: 0% auto auto 0%;
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
