import { describe, it, expect, beforeEach } from 'vitest'
import { useCarousel } from './useCarousel'

const makePhotos = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    type: 'photo' as const,
    path: `/photo-${i}.jpg`,
  }))

describe('useCarousel', () => {
  describe('navigation', () => {
    it('starts at index 0', () => {
      const { currentIndex } = useCarousel(makePhotos(3))
      expect(currentIndex.value).toBe(0)
    })

    it('goTo clamps to valid range', () => {
      const { goTo, currentIndex } = useCarousel(makePhotos(3))
      goTo(-1)
      expect(currentIndex.value).toBe(0)
      goTo(5)
      expect(currentIndex.value).toBe(2)
    })

    it('prev() decrements index', () => {
      const { prev, currentIndex } = useCarousel(makePhotos(3))
      prev()
      expect(currentIndex.value).toBe(0)
    })

    it('next() increments index', () => {
      const { next, currentIndex } = useCarousel(makePhotos(3))
      next()
      expect(currentIndex.value).toBe(1)
    })

    it('prev() does not go below 0', () => {
      const { prev, currentIndex } = useCarousel(makePhotos(3))
      for (let i = 0; i < 5; i++) prev()
      expect(currentIndex.value).toBe(0)
    })

    it('next() does not exceed max index', () => {
      const { next, currentIndex } = useCarousel(makePhotos(3))
      for (let i = 0; i < 5; i++) next()
      expect(currentIndex.value).toBe(2)
    })
  })

  describe('hasMultiple', () => {
    it('false for single photo', () => {
      const { hasMultiple } = useCarousel(makePhotos(1))
      expect(hasMultiple.value).toBe(false)
    })

    it('true for multiple photos', () => {
      const { hasMultiple } = useCarousel(makePhotos(3))
      expect(hasMultiple.value).toBe(true)
    })
  })

  describe('touch swipe navigation', () => {
    it('swipe left (<-50px) triggers next()', () => {
      const { handleTouchStart, handleTouchMove, handleTouchEnd, currentIndex } = useCarousel(makePhotos(3))
      const mockMoveEvent = { touches: [{ clientX: 100 }], preventDefault: vi.fn() } as unknown as TouchEvent
      handleTouchStart({ touches: [{ clientX: 150 }] } as TouchEvent)
      handleTouchMove(mockMoveEvent)
      handleTouchEnd()
      expect(currentIndex.value).toBe(1)
    })

    it('swipe right (>50px) triggers prev()', () => {
      const { handleTouchStart, handleTouchEnd, currentIndex } = useCarousel(makePhotos(3))
      handleTouchStart({ touches: [{ clientX: 200 }] } as TouchEvent)
      handleTouchEnd()
      expect(currentIndex.value).toBe(0)
    })

    it('touchmove calls preventDefault on drag', () => {
      const { handleTouchStart, handleTouchMove } = useCarousel(makePhotos(3))
      const mockEvent = { touches: [{ clientX: 150 }], preventDefault: vi.fn() } as unknown as TouchEvent
      handleTouchStart({ touches: [{ clientX: 100 }] } as TouchEvent)
      handleTouchMove(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('no preventDefault when not dragging', () => {
      const { handleTouchMove } = useCarousel(makePhotos(3))
      const mockEvent = { touches: [{ clientX: 150 }], preventDefault: vi.fn() } as unknown as TouchEvent
      handleTouchMove(mockEvent)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('swipe ignored on single photo', () => {
      const { handleTouchStart, handleTouchEnd, currentIndex, isDragging } = useCarousel(makePhotos(1))
      handleTouchStart({ touches: [{ clientX: 100 }] } as TouchEvent)
      handleTouchEnd()
      expect(currentIndex.value).toBe(0)
      expect(isDragging.value).toBe(false)
    })
  })

  describe('pointer drag navigation', () => {
    beforeEach(() => {
      // Mock setPointerCapture on HTMLElement for all pointer tests
      if (typeof HTMLElement !== 'undefined') {
        HTMLElement.prototype.setPointerCapture = vi.fn()
      }
    })

    it('sets isDragging on pointer down for multiple photos', () => {
      const { handlePointerDown, isDragging } = useCarousel(makePhotos(3))
      const target = { closest: () => false, setPointerCapture: vi.fn() } as unknown as HTMLElement
      handlePointerDown({ clientX: 100, pointerId: 1, currentTarget: target } as PointerEvent, target)
      expect(isDragging.value).toBe(true)
    })

    it('pointer move updates dragOffset', () => {
      const { handlePointerDown, handlePointerMove, dragOffset } = useCarousel(makePhotos(3))
      const target = { closest: () => false, setPointerCapture: vi.fn() } as unknown as HTMLElement
      handlePointerDown({ clientX: 100, pointerId: 1, currentTarget: target } as PointerEvent, target)
      handlePointerMove({ clientX: 150 } as PointerEvent)
      expect(dragOffset.value).toBe(50)
    })

    it('pointer up with >50px right swipe triggers prev', () => {
      const { handlePointerDown, handlePointerMove, handlePointerUp, currentIndex, isDragging } = useCarousel(makePhotos(3))
      const target = { closest: () => false, setPointerCapture: vi.fn() } as unknown as HTMLElement
      handlePointerDown({ clientX: 100, pointerId: 1, currentTarget: target } as PointerEvent, target)
      handlePointerMove({ clientX: 200 } as PointerEvent) // +100px right (swipe right)
      handlePointerUp()
      expect(currentIndex.value).toBe(0)
      expect(isDragging.value).toBe(false)
    })

    it('pointer up with <-50px left swipe triggers next', () => {
      const { handlePointerDown, handlePointerMove, handlePointerUp, currentIndex } = useCarousel(makePhotos(3))
      const target = { closest: () => false, setPointerCapture: vi.fn() } as unknown as HTMLElement
      handlePointerDown({ clientX: 100, pointerId: 1, currentTarget: target } as PointerEvent, target)
      handlePointerMove({ clientX: 20 } as PointerEvent) // -80px left (swipe left)
      handlePointerUp()
      expect(currentIndex.value).toBe(1)
    })

    it('pointer up with <50px movement does not navigate', () => {
      const { handlePointerDown, handlePointerMove, handlePointerUp, currentIndex } = useCarousel(makePhotos(3))
      const target = { closest: () => false, setPointerCapture: vi.fn() } as unknown as HTMLElement
      handlePointerDown({ clientX: 100, pointerId: 1, currentTarget: target } as PointerEvent, target)
      handlePointerMove({ clientX: 130 } as PointerEvent) // +30px (below threshold)
      handlePointerUp()
      expect(currentIndex.value).toBe(0)
    })

    it('ignores pointer down on button elements', () => {
      const { handlePointerDown, isDragging } = useCarousel(makePhotos(3))
      const target = { closest: (sel: string) => sel === 'button', setPointerCapture: vi.fn() } as unknown as HTMLElement
      handlePointerDown({ clientX: 100, pointerId: 1, currentTarget: target } as PointerEvent, target)
      expect(isDragging.value).toBe(false)
    })

    it('ignores pointer down on video elements', () => {
      const { handlePointerDown, isDragging } = useCarousel(makePhotos(3))
      const target = { closest: (sel: string) => sel === 'video', setPointerCapture: vi.fn() } as unknown as HTMLElement
      handlePointerDown({ clientX: 100, pointerId: 1, currentTarget: target } as PointerEvent, target)
      expect(isDragging.value).toBe(false)
    })
  })
})
