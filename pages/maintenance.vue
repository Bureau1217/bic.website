<template>
  <div class="maintenance">
    <!-- Grande image à gauche -->
    <div class="maintenance__left">
      <ResponsivePicture
        v-if="cover"
        :image="cover"
        alt="Notre Historia"
        loading="eager"
        picture-class="maintenance__picture"
      />
    </div>

    <!-- Deux images empilées à droite -->
    <div class="maintenance__right">
      <ResponsivePicture
        v-if="image1"
        :image="image1"
        alt=""
        loading="eager"
        picture-class="maintenance__picture"
      />
      <ResponsivePicture
        v-if="image2"
        :image="image2"
        alt=""
        loading="eager"
        picture-class="maintenance__picture"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResponsiveImage } from '~/types/image'

// Désactiver le layout par défaut (pas de menu, etc.)
definePageMeta({
  layout: false,
})

useHead({
  title: 'En construction - Notre Historia',
})

// Fetch des 3 images depuis le CMS
type MaintenanceData = {
  result: {
    home: {
      cover: ResponsiveImage | null
      image1: ResponsiveImage | null
      image2: ResponsiveImage | null
    }
  }
}

const { data } = await useFetch<MaintenanceData>('/api/CMS_KQLRequest', {
  method: 'POST',
  body: {
    query: 'site',
    select: {
      home: {
        query: "site.find('home')",
        select: {
          cover: 'page.responsiveImage("cover", "cover")',
          image1: 'page.responsiveImage("image1", "cover")',
          image2: 'page.responsiveImage("image2", "cover")',
        },
      },
    },
  },
})

const cover = computed(() => data.value?.result?.home?.cover || null)
const image1 = computed(() => data.value?.result?.home?.image1 || null)
const image2 = computed(() => data.value?.result?.home?.image2 || null)
</script>

<style lang="scss" scoped>
.maintenance {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
  background-color: var(--red, #c41e3a);
  overflow: hidden;
  display: flex;
}

.maintenance__left {
  width: 60%;
  height: 100%;
}

.maintenance__right {
  width: 40%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.maintenance__picture {
  width: 100%;
  height: 100%;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.maintenance__right .maintenance__picture {
  height: 50%;
}

// Mobile : empiler verticalement
@media screen and (max-width: 991px) {
  .maintenance {
    flex-direction: column;
  }

  .maintenance__left {
    width: 100%;
    height: 50%;
  }

  .maintenance__right {
    width: 100%;
    height: 50%;
    flex-direction: row;
  }

  .maintenance__right .maintenance__picture {
    width: 50%;
    height: 100%;
  }
}
</style>
