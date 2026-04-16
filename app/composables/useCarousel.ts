import { ref, computed } from 'vue'

export interface Media {
  type: 'photo' | 'video'
  path: string
  orderIndex?: number
}

export function useCarousel(photos: Media[]) {
  const currentIndex = ref(0)
  const isDragging = ref(false)
  const startX = ref(0)
  const currentX = ref(0)
  const isTouchSwiping = ref(false)

  const hasMultiple = computed(() => photos.length > 1)

  function goTo(index: number) {
    currentIndex.value = Math.max(0, Math.min(index, photos.length - 1))
  }

  function prev() {
    goTo(currentIndex.value - 1)
  }

  function next() {
    goTo(currentIndex.value + 1)
  }

  function handlePointerDown(e: PointerEvent, target: HTMLElement) {
    if (!hasMultiple.value) return
    if (target.closest('button')) return
    if (target.closest('video')) return
    isDragging.value = true
    isTouchSwiping.value = false
    startX.value = e.clientX
    currentX.value = e.clientX
    target.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging.value || isTouchSwiping.value) return
    currentX.value = e.clientX
  }

    function handlePointerUp() {
    if (!isDragging.value) return
    if (!isTouchSwiping.value) {
      const diff = currentX.value - startX.value
      // Swipe left (diff < 0) → next, swipe right (diff > 0) → prev
      if (diff < -50) next()
      else if (diff > 50) prev()
    }
    isDragging.value = false
  }

  function handleTouchStart(e: TouchEvent) {
    if (!hasMultiple.value) return
    isTouchSwiping.value = true
    isDragging.value = true
    startX.value = e.touches[0].clientX
    currentX.value = e.touches[0].clientX
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging.value || !isTouchSwiping.value) return
    currentX.value = e.touches[0].clientX
    e.preventDefault()
  }

  function handleTouchEnd() {
    if (!isDragging.value || !isTouchSwiping.value) return
    const diff = currentX.value - startX.value
    // Swipe left (diff <= -50) → next, swipe right (diff >= 50) → prev
    if (diff <= -50) next()
    else if (diff >= 50) prev()
    isDragging.value = false
    isTouchSwiping.value = false
  }

  const dragOffset = computed(() => {
    if (!isDragging.value) return 0
    return currentX.value - startX.value
  })

  return {
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
  }
}
