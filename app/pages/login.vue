<script setup lang="ts">
definePageMeta({
  middleware: ['guest']
})

const { fetch: refreshSession } = useUserSession()
const credentials = reactive({
  email: '',
  password: ''
})
const error = ref('')
const loading = ref(false)
const siteName = ref('Jolt Posts')

onMounted(async () => {
  const config = await $fetch<{ siteName: string }>('/api/config')
  siteName.value = config.siteName
})

async function login() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    await refreshSession()
    await navigateTo('/dashboard')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message ?? 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-10">
        <div class="inline-block p-4 mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
          <div class="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center">
            <span class="text-3xl font-bold text-white italic">I</span>
          </div>
        </div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent italic mb-2">
          {{ siteName }}
        </h1>
        <p class="text-gray-400">Welcome back</p>
      </div>
      
      <form class="relative" @submit.prevent="login">
        <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl blur-xl" ></div>
        <div class="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div class="space-y-5">
            <div v-if="error" class="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
              {{ error }}
            </div>
            <div>
              <input
                id="email"
                v-model="credentials.email"
                type="email"
                placeholder="Email address"
                required
                autocomplete="email"
                class="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
              />
            </div>
            <div>
              <input
                id="password"
                v-model="credentials.password"
                type="password"
                placeholder="Password"
                required
                autocomplete="current-password"
                class="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
              />
            </div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" ></div>
                Signing in...
              </span>
              <span v-else>Sign in</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>