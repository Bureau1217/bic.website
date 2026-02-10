/**
 * Composable global pour gérer le lecteur audio
 * L'état persiste entre les navigations de pages grâce à useState (Nuxt)
 * L'élément Audio est créé côté client et vit en dehors du cycle de rendu Vue
 */

export type AudioTrack = {
  title: string
  num: string | number | null
  audioUrl: string
  slug: string
  type: 'episode' | 'lieu'
}

// Instance Audio singleton côté client
let audioElement: HTMLAudioElement | null = null

function getAudioElement(): HTMLAudioElement {
  if (!audioElement) {
    audioElement = new Audio()
    audioElement.preload = 'metadata'
  }
  return audioElement
}

export function useAudioPlayer() {
  // État global partagé (persiste entre les pages)
  const isPlaying = useState<boolean>('audio-is-playing', () => false)
  const isMuted = useState<boolean>('audio-is-muted', () => false)
  const isVisible = useState<boolean>('audio-is-visible', () => false)
  const currentTrack = useState<AudioTrack | null>('audio-current-track', () => null)
  const currentTime = useState<number>('audio-current-time', () => 0)
  const duration = useState<number>('audio-duration', () => 0)

  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}' ${secs.toString().padStart(2, '0')}`
  }

  const currentTimeFormatted = computed(() => formatTime(currentTime.value))
  const durationFormatted = computed(() => formatTime(duration.value))

  /**
   * Initialise les écouteurs d'événements sur l'élément Audio
   * À appeler une seule fois dans app.vue via onMounted
   */
  const initAudioListeners = () => {
    if (import.meta.server) return

    const audio = getAudioElement()

    audio.addEventListener('timeupdate', () => {
      currentTime.value = audio.currentTime
    })

    audio.addEventListener('loadedmetadata', () => {
      duration.value = audio.duration
    })

    audio.addEventListener('durationchange', () => {
      duration.value = audio.duration
    })

    audio.addEventListener('ended', () => {
      playNext()
    })

    audio.addEventListener('play', () => {
      isPlaying.value = true
    })

    audio.addEventListener('pause', () => {
      isPlaying.value = false
    })
  }

  /**
   * Jouer la piste suivante automatiquement
   * Épisode -> épisode suivant, Lieu -> lieu suivant
   * Si c'est le dernier, on arrête la lecture
   */
  const playNext = () => {
    if (!currentTrack.value) {
      isPlaying.value = false
      return
    }

    const { lieux, episodes } = usePodcastData()
    const track = currentTrack.value

    if (track.type === 'episode') {
      const currentIndex = episodes.value.findIndex(e => e.slug === track.slug)
      const nextEpisode = episodes.value[currentIndex + 1]
      if (nextEpisode?.audio?.url) {
        playTrack({
          title: nextEpisode.title,
          num: nextEpisode.num,
          audioUrl: nextEpisode.audio.url,
          slug: nextEpisode.slug,
          type: 'episode',
        })
        return
      }
    } else if (track.type === 'lieu') {
      const currentIndex = lieux.value.findIndex(l => l.slug === track.slug)
      const nextLieu = lieux.value[currentIndex + 1]
      if (nextLieu?.audio?.url) {
        playTrack({
          title: nextLieu.title,
          num: nextLieu.num,
          audioUrl: nextLieu.audio.url,
          slug: nextLieu.slug,
          type: 'lieu',
        })
        return
      }
    }

    // Dernier élément de la liste : on arrête
    isPlaying.value = false
  }

  /**
   * Jouer une piste audio
   */
  const playTrack = (track: AudioTrack) => {
    if (import.meta.server) return

    const audio = getAudioElement()

    // Si c'est la même piste, reprendre la lecture
    if (currentTrack.value?.audioUrl === track.audioUrl) {
      audio.play()
      isPlaying.value = true
      isVisible.value = true
      return
    }

    // Nouvelle piste
    currentTrack.value = track
    audio.src = track.audioUrl
    audio.load()
    audio.play()
    isPlaying.value = true
    isVisible.value = true
    currentTime.value = 0
    duration.value = 0
  }

  /**
   * Basculer lecture/pause
   */
  const togglePlay = () => {
    if (import.meta.server) return

    const audio = getAudioElement()

    if (isPlaying.value) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  /**
   * Basculer le mute
   */
  const toggleMute = () => {
    if (import.meta.server) return

    const audio = getAudioElement()
    isMuted.value = !isMuted.value
    audio.muted = isMuted.value
  }

  /**
   * Fermer le lecteur et arrêter l'audio
   */
  const close = () => {
    if (import.meta.server) return

    const audio = getAudioElement()
    audio.pause()
    audio.currentTime = 0
    isPlaying.value = false
    isVisible.value = false
    currentTrack.value = null
    currentTime.value = 0
    duration.value = 0
  }

  /**
   * Aller à une position dans la piste (en pourcentage 0-100)
   */
  const seekTo = (percent: number) => {
    if (import.meta.server) return

    const audio = getAudioElement()
    if (audio.duration) {
      audio.currentTime = (percent / 100) * audio.duration
    }
  }

  return {
    // État
    isPlaying,
    isMuted,
    isVisible,
    currentTrack,
    currentTime,
    duration,
    progress,
    currentTimeFormatted,
    durationFormatted,

    // Actions
    initAudioListeners,
    playTrack,
    togglePlay,
    toggleMute,
    close,
    seekTo,
  }
}
