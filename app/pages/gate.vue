<script setup lang="ts">
definePageMeta({
  layout: false
})

const { isDark, init } = useTheme()
const pin = ref('')
const error = ref('')
const loading = ref(false)
const siteName = ref('Jolt Posts')

onMounted(() => {
  init()
  loadConfig()
})

async function loadConfig() {
  const config = await $fetch<{ siteName: string }>('/api/config')
  siteName.value = config.siteName
}

function handleDigit(digit: string) {
  if (pin.value.length < 4) {
    pin.value += digit
    if (pin.value.length === 4) {
      verify(pin.value)
    }
  }
}

function handleDelete() {
  pin.value = pin.value.slice(0, -1)
  error.value = ''
}

async function verify(pinValue: string) {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/verify-site-password', {
      method: 'POST',
      body: { password: pinValue }
    })
    const cookie = useCookie('site-password-verified', { maxAge: 60 * 60 * 24 * 30 })
    cookie.value = 'true'
    await navigateTo('/')
  } catch {
    error.value = 'Incorrect PIN'
    pin.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div :class="isDark ? 'min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a] text-white flex flex-col' : 'min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 text-gray-900 flex flex-col'">
    <div class="flex-1 flex flex-col items-center justify-center px-6">
      <div class="text-center mb-12">
        <div class="inline-block p-4 mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
          <div class="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent italic mb-2">
          {{ siteName }}
        </h1>
        <p :class="isDark ? 'text-gray-400' : 'text-gray-600'">Enter your PIN to view</p>
      </div>
      
      <div class="flex justify-center gap-4 mb-8">
        <div 
          v-for="i in 4" 
          :key="i" 
          class="w-4 h-4 rounded-full transition-all duration-200"
          :class="pin.length >= i ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-110' : isDark ? 'bg-gray-700' : 'bg-gray-300'"
        ></div>
      </div>
      
      <p v-if="error" class="text-center text-red-400 text-sm mb-4">{{ error }}</p>
      
      <div :class="isDark ? 'space-y-4' : 'space-y-4'">
        <div class="flex justify-center gap-4">
          <button class="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-light transition-all duration-200 active:scale-95" :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'" @click="handleDigit('1')">1</button>
          <button class="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-light transition-all duration-200 active:scale-95" :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'" @click="handleDigit('2')">2</button>
          <button class="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-light transition-all duration-200 active:scale-95" :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'" @click="handleDigit('3')">3</button>
        </div>
        <div class="flex justify-center gap-4">
          <button class="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-light transition-all duration-200 active:scale-95" :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'" @click="handleDigit('4')">4</button>
          <button class="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-light transition-all duration-200 active:scale-95" :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'" @click="handleDigit('5')">5</button>
          <button class="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-light transition-all duration-200 active:scale-95" :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'" @click="handleDigit('6')">6</button>
        </div>
        <div class="flex justify-center gap-4">
          <button class="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-light transition-all duration-200 active:scale-95" :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'" @click="handleDigit('7')">7</button>
          <button class="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-light transition-all duration-200 active:scale-95" :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'" @click="handleDigit('8')">8</button>
          <button class="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-light transition-all duration-200 active:scale-95" :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'" @click="handleDigit('9')">9</button>
        </div>
        <div class="flex justify-center gap-4">
          <div class="w-20 h-20" ></div>
          <button class="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-light transition-all duration-200 active:scale-95" :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'" @click="handleDigit('0')">0</button>
          <button class="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-light transition-all duration-200 active:scale-95" :class="isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'" @click="handleDelete">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>