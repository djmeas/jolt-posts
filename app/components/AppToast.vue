<script setup lang="ts">
const { toasts } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-50 space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-2 animate-slide-up"
        :class="toast.type === 'success' 
          ? 'bg-green-500/90 text-white' 
          : 'bg-red-500/90 text-white'"
      >
        <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span class="text-sm font-medium">{{ toast.message }}</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
