<script setup lang="ts">
import { useCarousel } from '~/composables/useCarousel'

interface Media {
  type: 'photo' | 'video'
  path: string
  orderIndex?: number
}

const props = defineProps<{
  photos: Media[]
}>()

const {
  currentIndex,
  isDragging,
  isTouchSwiping,
  hasMultiple,
  dragOffset,
  goTo,
  prev,
  next,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
} = useCarousel(props.photos)

function onPointerDown(e: PointerEvent) {
  handlePointerDown(e, e.currentTarget as HTMLElement)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div
    v-if="photos.length > 0"
    class="relative select-none"
    style="overscroll-behavior: contain"
  >
    <div
      class="flex"
      :class="isDragging ? 'transition-none' : 'transition-transform duration-300 ease-out'"
      :style="{
        transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0px)',
        cursor: hasMultiple ? 'grab' : 'default'
      }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div
        v-for="(media, index) in photos"
        :key="media.path"
        class="w-full flex-shrink-0"
        :class="index === currentIndex ? 'block' : 'hidden'"
      >
        <img v-if="media.type === 'photo'" :src="media.path" class="w-full aspect-square object-cover" draggable="false" />
        <video v-else :src="media.path" class="w-full aspect-square object-cover" controls playsinline></video>
      </div>
    </div>

    <button
      v-if="photos.length > 1 && currentIndex > 0"
      class="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all duration-200 hover:scale-110 z-10"
      @click="prev"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <button
      v-if="photos.length > 1 && currentIndex < photos.length - 1"
      class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all duration-200 hover:scale-110 z-10"
      @click="next"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <div v-if="photos.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
      <button
        v-for="(_, index) in photos"
        :key="index"
        class="w-2 h-2 rounded-full transition-all duration-200"
        :class="index === currentIndex ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/70'"
        @click="goTo(index)"
      ></button>
    </div>
  </div>
</template>