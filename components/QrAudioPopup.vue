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

// === QR Audio Popup ===
.qr-popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--20);
}

.qr-popup {
  background-color: var(--black);
  height: 400px;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-flow: column;
  align-items: center;
  gap: var(--15);
  text-align: center;
}

.qr-popup_content {
  display: flex;
  flex-flow: column;
  padding: 0 var(--20);
}

.qr-popup_icon {
  width: 50px;
  height: 50px;
}

.qr-popup_image-wrapper {
  width: 100%;
  max-height: 200px;
  overflow: hidden;
  margin-bottom: var(--5);
}

.qr-popup_image {
  width: 100%;
  height: 100%;
  max-height: 200px;
  object-fit: cover;
  display: block;
}

.qr-popup_title {
  color: var(--yellow);
  font-family: Solfa, sans-serif;
  font-size: 24px;
  margin: 0;
}

.qr-popup_text {
  color: var(--white);
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 16px;
  line-height: 1.4;
  margin: 0;

  strong {
    color: var(--yellow);
  }
}

.qr-popup_actions {
  display: flex;
  flex-flow: column;
  gap: var(--10);
  width: 100%;
  margin-top: var(--10);
}

.qr-popup_btn {
  width: 100%;
  padding: 14px var(--20);
  border: none;
  border-radius: 100px;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }

  &.is-yes {
    background-color: var(--green);
    color: var(--white);
  }

  &.is-no {
    background-color: transparent;
    color: var(--white);
    border: 1px solid var(--white);
  }
}

// Transition du popup
.qr-popup-enter-active,
.qr-popup-leave-active {
  transition: opacity 0.3s ease;
}

.qr-popup-enter-active .qr-popup,
.qr-popup-leave-active .qr-popup {
  transition: transform 0.3s ease;
}

.qr-popup-enter-from,
.qr-popup-leave-to {
  opacity: 0;
}

.qr-popup-enter-from .qr-popup {
  transform: scale(0.9) translateY(20px);
}

.qr-popup-leave-to .qr-popup {
  transform: scale(0.9) translateY(20px);
}

</style>
