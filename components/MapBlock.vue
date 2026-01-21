<template>
  <div class="map">
    <slot>
      <!-- Default slot for map content like AudioCardMap -->
    </slot>
  </div>
</template>

<script setup>
</script>

<style lang="scss">
// Map Block Component Styles
.map {
  width: var(--100);
  height: var(--100vh);
  background-color: var(--black);
  position: relative;
}
</style>
