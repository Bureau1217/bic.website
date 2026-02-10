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

<style lang="scss">
</style>
