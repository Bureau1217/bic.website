<template>
  <div class="list is-last" id="agenda">
    <h2 class="list_title">{{ title }}</h2>
    <div class="list_line--header">
      <div class="list_line_wrapper">
        <div class="list_case">
          <p class="list_label"><strong>Dates</strong></p>
        </div>
        <div class="list_case">
          <p class="list_label"><strong>Evénements</strong></p>
        </div>
        <div class="list_case">
          <p class="list_label"><strong>Lieu</strong></p>
        </div>
      </div>
    </div>
    <div class="list_wrapper">
      <div
        v-for="(event, index) in events"
        :key="index"
        class="list_line"
        :class="{ 'is-past': isEventPast(event.date) }"
        @click="toggleEvent(index)"
      >
        <div class="list_plus" >
          <div class="list_plus_line"></div>
          <div class="list_plus_line is-vertical" v-show="!openEvents[index]"></div>
        </div>
        <div class="list_line_wrapper">
          <div class="list_case">
            <p class="list_label">{{ formatEventDate(event.date) }}</p>
          </div>
          <div class="list_case">
            <p class="list_label is-bold">{{ event.title }}</p>
          </div>
          <div class="list_case">
            <a
              v-if="event.link"
              class="list_label"
              :href="event.link"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop
            >
              {{ event.venue }}
            </a>
            <p v-else class="list_label">{{ event.venue }}</p>
          </div>
        </div>
        <Transition
          @before-enter="beforeEnter"
          @enter="enter"
          @after-enter="afterEnter"
          @before-leave="beforeLeave"
          @leave="leave"
          @after-leave="afterLeave"
        >
          <div class="list_desc" v-show="openEvents[index]">
            <p class="list_dev_text">{{ event.description }}</p>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Agenda'
  },
  events: {
    type: Array,
    default: () => [
      {
        date: 'ex. 17 mars 2025 - 17h',
        title: 'ex. INAUGURATION DE "NOTRE HISTORIA"',
        venue: 'ex. Consulat général du portugal',
        link: '',
        address: 'ex.  Rue du Conseil Général<br>1204 Genève',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      }
    ]
  }
})

const openEvents = reactive({})

// Initialize all events as closed
props.events.forEach((_, index) => {
  openEvents[index] = false
})

const toggleEvent = (index) => {
  openEvents[index] = !openEvents[index]
}

const transitionTiming =
  'height 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease, padding-top 0.45s cubic-bezier(0.22, 1, 0.36, 1), padding-bottom 0.45s cubic-bezier(0.22, 1, 0.36, 1)'

const beforeEnter = (el) => {
  const computedStyle = window.getComputedStyle(el)
  el.dataset.paddingTop = computedStyle.paddingTop
  el.dataset.paddingBottom = computedStyle.paddingBottom
  el.style.height = '0'
  el.style.opacity = '0'
  el.style.paddingTop = '0'
  el.style.paddingBottom = '0'
  el.style.overflow = 'hidden'
  el.style.transition = transitionTiming
}

const enter = (el) => {
  const targetPaddingTop = el.dataset.paddingTop || '0px'
  const targetPaddingBottom = el.dataset.paddingBottom || '0px'
  el.style.paddingTop = targetPaddingTop
  el.style.paddingBottom = targetPaddingBottom
  const targetHeight = el.scrollHeight
  void el.offsetHeight
  el.style.height = `${targetHeight}px`
  el.style.opacity = '1'
}

const afterEnter = (el) => {
  el.style.height = 'auto'
  el.style.overflow = ''
  el.style.paddingTop = ''
  el.style.paddingBottom = ''
  el.style.transition = ''
}

const beforeLeave = (el) => {
  const computedStyle = window.getComputedStyle(el)
  el.dataset.paddingTop = computedStyle.paddingTop
  el.dataset.paddingBottom = computedStyle.paddingBottom
  el.style.paddingTop = el.dataset.paddingTop
  el.style.paddingBottom = el.dataset.paddingBottom
  el.style.height = `${el.scrollHeight}px`
  el.style.opacity = '1'
  el.style.overflow = 'hidden'
  el.style.transition = transitionTiming
}

const leave = (el) => {
  void el.offsetHeight
  el.style.height = '0'
  el.style.opacity = '0'
  el.style.paddingTop = '0'
  el.style.paddingBottom = '0'
}

const afterLeave = (el) => {
  el.style.height = ''
  el.style.opacity = ''
  el.style.overflow = ''
  el.style.paddingTop = ''
  el.style.paddingBottom = ''
  el.style.transition = ''
  delete el.dataset.paddingTop
  delete el.dataset.paddingBottom
}

const formatDatePart = (value = '') => {
  const trimmedValue = value.trim()
  const isoDateMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!isoDateMatch) {
    return trimmedValue
  }

  const [, year, month, day] = isoDateMatch
  const parsedDate = new Date(`${year}-${month}-${day}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return trimmedValue
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate)
}

const formatTimePart = (value = '') => {
  const trimmedValue = value.trim()
  if (!trimmedValue) return ''

  const timeMatch = trimmedValue.match(/^(\d{1,2})(?:[:hH](\d{1,2}))?(?:[:hH](\d{1,2}))?$/)
  if (!timeMatch) {
    return trimmedValue
  }

  const hours = String(Math.min(23, Math.max(0, Number(timeMatch[1]))))
  const minutes = String(Math.min(59, Math.max(0, Number(timeMatch[2] || '0')))).padStart(2, '0')
  return `${hours}h${minutes}`
}

const formatEventDate = (value = '') => {
  const trimmedValue = value.trim()
  if (!trimmedValue) return ''

  const dateWithTimeMatch = trimmedValue.match(/^(.*?)(?:\s+-\s+(.+?))(?:\s+à\s+(.+))?$/)

  if (!dateWithTimeMatch) {
    return formatDatePart(trimmedValue)
  }

  const [, rawDate, rawStartTime = '', rawEndTime = ''] = dateWithTimeMatch
  const formattedDate = formatDatePart(rawDate)
  const formattedStartTime = formatTimePart(rawStartTime)
  const formattedEndTime = formatTimePart(rawEndTime)

  if (formattedStartTime && formattedEndTime) {
    return `${formattedDate} - ${formattedStartTime} à ${formattedEndTime}`
  }

  if (formattedStartTime) {
    return `${formattedDate} - ${formattedStartTime}`
  }

  return formattedDate
}

// Vérifie si un événement est passé
const isEventPast = (dateValue = '') => {
  const trimmedValue = dateValue.trim()
  if (!trimmedValue) return false

  // Extraire la date (avant le " - ")
  const dateWithTimeMatch = trimmedValue.match(/^(.*?)(?:\s+-\s+|$)/)
  const rawDate = dateWithTimeMatch ? dateWithTimeMatch[1].trim() : trimmedValue

  // Parser la date ISO (YYYY-MM-DD)
  const isoDateMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!isoDateMatch) return false

  const [, year, month, day] = isoDateMatch
  const eventDate = new Date(`${year}-${month}-${day}T23:59:59`)
  const today = new Date()

  return eventDate < today
}
</script>

<style lang="scss">
.list_line.is-past {
  opacity: 0.5;

  .list_label,
  .list_plus_line {
    color: var(--red);
    background-color: var(--red);
  }

  .list_label {
    background-color: transparent;
  }
}
</style>
