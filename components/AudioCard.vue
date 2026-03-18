<template>
  <div
    ref="cardRef"
    v-show="isVisible"
    :class="rootClass"
    :style="cardStyle"
    v-bind="$attrs"
    @mousedown="onDragStart"
    @dragstart.prevent
  >
    <button
      v-if="showDismissButton"
      type="button"
      class="audio-card_close"
      aria-label="Masquer la carte"
      @click.prevent.stop="hideCard"
    >
      <img src="/images/player-close.svg" loading="lazy" decoding="async" alt="" class="audio-card_close-icon" width="30" height="30">
    </button>
    <div class="audio-card_image_wrapper">
      <slot name="image">
        <img 
          v-if="image" 
          :src="image" 
          :srcset="srcset" 
          :sizes="sizes" 
          :alt="alt" 
          loading="lazy" 
          class="audio-card_image"
        />
      </slot>
      <div v-if="showButton" class="audio-card_button" @click.prevent.stop="onPlayButtonClick">
        <img class="image" :src="playButtonIcon" loading="lazy" decoding="async" alt="" width="30" height="30">
        <span v-if="duration" class="audio-card_time">{{ duration }}</span>
      </div>
    </div>
    <div class="audio-card_info" >
      <slot name="info">
        <div v-if="number" class="audio-card_number">{{ number }}.</div>
        <p class="audio-card_title">{{ title }}</p>
        <p v-if="description" class="audio-card_info_text">
          {{ description }}
        </p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { CSSProperties } from 'vue'

type AudioCardVariant = 'default' | 'home' | 'parcours-home' | 'menu-episode' | 'menu-catalogue' | 'map-popup'
const props = withDefaults(defineProps<{
  /** Variante visuelle de la carte */
  variant?: AudioCardVariant
  /** URL de l'image (fallback si pas de slot #image) */
  image?: string
  srcset?: string
  sizes?: string
  alt?: string
  /** Durée formatée (ex: "12'34") */
  duration?: string
  /** Numéro du lieu/épisode */
  number?: string | number | null
  title?: string
  description?: string
  descriptionBlack?: boolean
  /** Couleur de fond de la zone info */
  bgColor?: 'green' | 'red' | ''
  /** Afficher le bouton play */
  showButton?: boolean
  /** URL audio de la card (pour sync play/pause) */
  trackAudioUrl?: string
  /** Animation d'entrée (slide + opacity) */
  entranceAnimation?: boolean
}>(), {
  variant: 'default',
  image: '',
  srcset: '',
  sizes: '(max-width: 2400px) 100vw, 2400px',
  alt: '',
  duration: '',
  number: null,
  title: '',
  description: '',
  descriptionBlack: false,
  bgColor: '',
  showButton: true,
  trackAudioUrl: '',
  entranceAnimation: false,
})

const emit = defineEmits<{
  play: []
}>()

const { currentTrack, isPlaying, togglePlay } = useAudioPlayer()

const rootClass = computed(() => [
  'audio-card',
  `audio-card--${props.variant}`,
  {
    'is-draggable': isCardDraggable.value,
    'is-dragging': isDragging.value,
    'is-entering': props.entranceAnimation && !hasEntered.value,
    'has-entered': props.entranceAnimation && hasEntered.value,
  },
])

const isVisible = ref(true)
const showDismissButton = computed(() => props.variant === 'home' || props.variant === 'default' || props.variant === 'parcours-home')
const cardRef = ref<HTMLElement | null>(null)
const isCurrentTrack = computed(() => !!props.trackAudioUrl && currentTrack.value?.audioUrl === props.trackAudioUrl)
const playButtonIcon = computed(() => {
  if (isCurrentTrack.value && isPlaying.value) return '/images/son-pause.svg'
  return '/images/son-play.svg'
})

const isDesktop = ref(false)
const isDragging = ref(false)
const dragPosition = ref<{ left: number; top: number } | null>(null)
const dragStartMouse = ref({ x: 0, y: 0 })
const dragStartPosition = ref({ left: 0, top: 0 })
const hasEntered = ref(!props.entranceAnimation)
let entranceTimer: ReturnType<typeof setTimeout> | null = null

const isDragEnabledVariant = computed(() => props.variant === 'home' || props.variant === 'default' || props.variant === 'parcours-home')
const isCardDraggable = computed(() => isDragEnabledVariant.value && isDesktop.value)

const cardStyle = computed<CSSProperties | undefined>(() => {
  if (!isCardDraggable.value || !dragPosition.value) return undefined
  return {
    position: 'fixed',
    left: `${dragPosition.value.left}px`,
    top: `${dragPosition.value.top}px`,
    right: 'auto',
    bottom: 'auto',
  }
})

const clampPosition = (left: number, top: number) => {
  if (!cardRef.value) {
    return {
      left: Math.max(left, 0),
      top: Math.max(top, 0),
    }
  }

  const maxLeft = Math.max(window.innerWidth - cardRef.value.offsetWidth, 0)
  const maxTop = Math.max(window.innerHeight - cardRef.value.offsetHeight, 0)

  return {
    left: Math.min(Math.max(left, 0), maxLeft),
    top: Math.min(Math.max(top, 0), maxTop),
  }
}

const setPositionFromCurrentRect = () => {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  dragPosition.value = clampPosition(rect.left, rect.top)
}

const updateDesktopState = () => {
  if (import.meta.server) return
  isDesktop.value = window.matchMedia('(min-width: 992px) and (pointer: fine)').matches
}

const hideCard = () => {
  isVisible.value = false
}

const onPlayButtonClick = () => {
  if (isCurrentTrack.value) {
    togglePlay()
    return
  }
  emit('play')
}

const onDragMove = (event: MouseEvent) => {
  if (!isDragging.value || !cardRef.value) return

  const deltaX = event.clientX - dragStartMouse.value.x
  const deltaY = event.clientY - dragStartMouse.value.y

  dragPosition.value = clampPosition(
    dragStartPosition.value.left + deltaX,
    dragStartPosition.value.top + deltaY,
  )
}

const stopDrag = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', stopDrag)
  document.body.style.userSelect = ''
}

const onDragStart = (event: MouseEvent) => {
  if (!isCardDraggable.value || event.button !== 0 || !cardRef.value) return

  const target = event.target as HTMLElement | null
  if (target?.closest('.audio-card_button, .audio-card_close, a, button, input, textarea, select')) {
    return
  }

  event.preventDefault()

  const rect = cardRef.value.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  if (!dragPosition.value) {
    dragPosition.value = clampPosition(rect.left, rect.top)
  }

  dragStartMouse.value = {
    x: event.clientX,
    y: event.clientY,
  }
  dragStartPosition.value = {
    left: dragPosition.value.left,
    top: dragPosition.value.top,
  }

  isDragging.value = true
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', stopDrag)
  document.body.style.userSelect = 'none'
}

onMounted(async () => {
  updateDesktopState()
  window.addEventListener('resize', updateDesktopState, { passive: true })

  if (props.entranceAnimation) {
    entranceTimer = setTimeout(() => {
      hasEntered.value = true
    }, 500)
  }

  await nextTick()
  if (!isDragEnabledVariant.value) return

  // Toujours repartir de la position initiale à chaque montage de la page.
  setPositionFromCurrentRect()
})

onBeforeUnmount(() => {
  if (entranceTimer) {
    clearTimeout(entranceTimer)
  }
  window.removeEventListener('resize', updateDesktopState)
  stopDrag()
})

</script>

<style lang="scss">
.audio-card.is-draggable {
  cursor: grab;
}

.audio-card.is-dragging {
  cursor: grabbing;
}

.audio-card.is-entering {
  opacity: 0;
  transform: translateY(-14px);
}

.audio-card.has-entered {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.audio-card_close {
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
}

.audio-card_close-icon {
  width: 30px;
  height: 30px;
  display: block;
  opacity: 1;
  transition: opacity 0.25s ease;
}

.audio-card_close:hover .audio-card_close-icon {
  opacity: 0.7;
}
</style>
