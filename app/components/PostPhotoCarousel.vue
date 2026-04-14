<script setup lang="ts">
interface Media {
  type: 'photo' | 'video'
  path: string
  orderIndex?: number
}

const props = defineProps<{
  photos: Media[]
}>()

const currentIndex = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const isTouchSwiping = ref(false)

function goTo(index: number) {
  currentIndex.value = Math.max(0, Math.min(index, props.photos.length - 1))
}

function prev() {
  goTo(currentIndex.value - 1)
}

function next() {
  goTo(currentIndex.value + 1)
}

function onPointerDown(e: PointerEvent) {
  if (props.photos.length <= 1) return
  if (e.target instanceof HTMLElement && e.target.closest('button')) return
  if (e.target instanceof HTMLElement && e.target.closest('video')) return
  isDragging.value = true
  isTouchSwiping.value = false
  startX.value = e.clientX
  currentX.value = e.clientX
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value || isTouchSwiping.value) return
  currentX.value = e.clientX
}

function onPointerUp() {
  if (!isDragging.value) return
  if (!isTouchSwiping.value) {
    const diff = currentX.value - startX.value
    if (diff > 50) prev()
    else if (diff < -50) next()
  }
  isDragging.value = false
}

function onTouchStart(e: TouchEvent) {
  if (props.photos.length <= 1) return
  isTouchSwiping.value = true
  isDragging.value = true
  startX.value = e.touches[0].clientX
  currentX.value = e.touches[0].clientX
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value || !isTouchSwiping.value) return
  currentX.value = e.touches[0].clientX
}

function onTouchEnd() {
  if (!isDragging.value || !isTouchSwiping.value) return
  const diff = currentX.value - startX.value
  if (diff > 50) prev()
  else if (diff < -50) next()
  isDragging.value = false
  isTouchSwiping.value = false
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
  >
    <div
      class="flex"
      :class="isDragging ? 'transition-none' : 'transition-transform duration-300 ease-out'"
      :style="{
        transform: isDragging ? `translateX(${currentX - startX}px)` : 'translateX(0px)',
        cursor: photos.length > 1 ? 'grab' : 'default'
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