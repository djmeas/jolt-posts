<script setup lang="ts">
defineProps<{
  open: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="emit('cancel')"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div
          class="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
          :class="danger
            ? 'bg-gradient-to-br from-red-900 to-black border border-red-500/30'
            : 'bg-gradient-to-br from-gray-900 to-black border border-white/10'"
        >
          <h3 v-if="title" class="text-lg font-bold mb-2" :class="danger ? 'text-red-400' : 'bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent'">
            {{ title }}
          </h3>
          <p class="text-gray-300 mb-6">{{ message }}</p>
          <div class="flex gap-3">
            <button
              class="flex-1 py-3 rounded-xl font-semibold transition-all duration-200"
              :class="danger
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-white/10 text-white hover:bg-white/20'"
              @click="emit('cancel')"
            >
              {{ cancelText || 'Cancel' }}
            </button>
            <button
              class="flex-1 py-3 rounded-xl font-bold transition-all duration-200"
              :class="danger
                ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/30'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/30'"
              @click="emit('confirm')"
            >
              {{ confirmText || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active > div:last-child,
.dialog-leave-active > div:last-child {
  transition: transform 0.2s ease;
}

.dialog-enter-from > div:last-child,
.dialog-leave-to > div:last-child {
  transform: scale(0.95);
}
</style>
