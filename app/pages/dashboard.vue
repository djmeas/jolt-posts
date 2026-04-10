<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const { user, clear: clearSession } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clearSession()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-lg">
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to home
      </NuxtLink>
      
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl blur-xl" ></div>
        <div class="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {{ user?.email?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white">
                Welcome{{ user?.email ? `, ${user.email.split('@')[0]}` : '' }}
              </h1>
              <p class="text-gray-400 text-sm">Signed in</p>
            </div>
          </div>
          
          <p v-if="user?.isAdmin" class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 mb-6">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Admin
          </p>
          
          <button
            type="button"
            class="w-full py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-300"
            @click="logout"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>