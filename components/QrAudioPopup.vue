<template>
  <Teleport to="body">
    <Transition name="qr-popup">
      <div v-if="modelValue" class="qr-popup-overlay" @click.self="dismiss">
        <div class="qr-popup">
          <div v-if="image" class="qr-popup_image-wrapper">
            <img 
              :src="image" 
              loading="lazy" 
              :alt="title" 
              class="qr-popup_image"
            >
          </div>    
          <div class="qr-popup_content">
            <p class="qr-popup_text">
              Voulez-vous lancer l'audio de <strong>{{ title }}</strong>&nbsp;?
            </p>
            <div class="qr-popup_actions">
              <button class="qr-popup_btn is-yes" @click="accept">
                Oui, écouter
              </button>
              <button class="qr-popup_btn is-no" @click="dismiss">
                Non merci
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  image: string
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  play: []
}>()

const accept = () => {
  emit('update:modelValue', false)
  emit('play')
}

const dismiss = () => {
  emit('update:modelValue', false)
}
</script>

<style lang="scss">
</style>
