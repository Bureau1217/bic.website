<template>
  <div class="list" id="agenda">
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
      >
        <div class="list_plus" @click="toggleEvent(index)">
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
            <p class="list_label">{{ event.venue }}</p>
          </div>
        </div>
        <div class="list_desc" v-show="openEvents[index]">
          <p class="list_dev_text">{{ event.description }}</p>
        </div>
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

  const timeMatch = trimmedValue.match(/^(\d{1,2})(?:[:hH](\d{1,2}))?$/)
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
</script>

<style lang="scss">
</style>
