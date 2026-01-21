<template>
  <div class="audioplayer" v-show="visible">
    <div class="audioplayer-wrapper">
      <img 
        :src="isPlaying ? '/images/Play-Player.svg' : '/images/Play-Player.svg'" 
        loading="lazy" 
        alt="Play/Pause" 
        class="audioplayer_icon"
        @click="togglePlay"
      >
      <img 
        src="/images/Son-Player.svg" 
        loading="lazy" 
        alt="Volume" 
        class="audioplayer_icon is-sound"
        @click="toggleMute"
      >
      <div class="audioplayer_line">
        <p class="audioplayer_name">{{ trackNumber }}. {{ trackTitle }}</p>
        <div class="audioplayer_progression" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="audioplayer_time">{{ currentTimeFormatted }} / {{ durationFormatted }}</p>
      <img 
        src="/images/Croix-Player.svg" 
        loading="lazy" 
        alt="Fermer" 
        class="audioplayer_icon"
        @click="close"
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  trackNumber: {
    type: [String, Number],
    default: '8'
  },
  trackTitle: {
    type: String,
    default: 'Les collectivités portugaise à Genève Itinéraire mémoriael à travers le canton'
  },
  currentTime: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['play', 'pause', 'close', 'mute'])

const isPlaying = ref(false)
const isMuted = ref(false)

const progress = computed(() => {
  if (props.duration === 0) return 0
  return (props.currentTime / props.duration) * 100
})

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}' ${secs.toString().padStart(2, '0')}`
}

const currentTimeFormatted = computed(() => formatTime(props.currentTime))
const durationFormatted = computed(() => formatTime(props.duration))

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  emit(isPlaying.value ? 'play' : 'pause')
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  emit('mute', isMuted.value)
}

const close = () => {
  emit('close')
}
</script>

<style lang="scss">
</style>
