<script setup lang="ts">
// AGENT: posts-view

interface Photo {
  path: string
  orderIndex: number
}

interface Video {
  path: string
}

interface Post {
  id: number
  photoPath: string
  description: string
  createdAt: Date | number
  heartCount?: number
  photos?: Photo[]
  videoPath?: Video | null
}

const posts = ref<Post[]>([])
const hasMore = ref(true)
const viewMode = ref<'feed' | 'grid'>('feed')
const selectedPost = ref<Post | null>(null)
const { isDark, toggle, init } = useTheme()
const { loggedIn } = useUserSession()
const config = ref<{ displayName: string; siteName: string; avatarPath: string; commentsEnabled: boolean; commentsModerated: boolean }>({ displayName: 'Jolt Posts', siteName: 'Jolt Posts', avatarPath: '', commentsEnabled: false, commentsModerated: false })

onMounted(() => {
  init()
})

async function loadPosts() {
  const { items, hasMore: more } = await $fetch('/api/posts?limit=10&offset=0')
  posts.value = items
  hasMore.value = more
}

async function loadMore() {
  const { items, hasMore: more } = await $fetch(`/api/posts?limit=10&offset=${posts.value.length}`)
  posts.value.push(...items)
  hasMore.value = more
}

async function loadConfig() {
  config.value = await $fetch('/api/config')
}

loadPosts()
loadConfig()

function formatDate(date: Date | number) {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function openPost(post: Post) {
  selectedPost.value = post
}

async function heartPost(post: Post) {
  await $fetch(`/api/posts/${post.id}`, { method: 'POST' })
  post.heartCount++
}

function closePost() {
  selectedPost.value = null
}

function getDisplayMedia(post: Post) {
  if (post.videoPath) {
    return [{ type: 'video' as const, path: post.videoPath.path }]
  }
  if (post.photos && post.photos.length > 0) {
    return post.photos
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(p => ({ type: 'photo' as const, path: p.path }))
  }
  return [{ type: 'photo' as const, path: post.photoPath }]
}

function getThumbnail(post: Post) {
  if (post.videoPath) {
    return post.videoPath.path
  }
  if (post.photos && post.photos.length > 0) {
    return post.photos.sort((a, b) => a.orderIndex - b.orderIndex)[0].path
  }
  return post.photoPath
}

function hasMultipleMedia(post: Post) {
  if (post.videoPath) return false
  return post.photos && post.photos.length > 1
}
</script>

<template>
  <div :class="isDark ? 'min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a] text-white' : 'min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 text-gray-900'">
    <header :class="isDark ? 'sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10' : 'sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-black/10'">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <span class="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
          {{ config.siteName }}
        </span>
        <div class="flex items-center gap-4">
          <button
            class="p-2 rounded-full transition-all duration-300 hover:scale-110"
            :class="isDark ? 'text-gray-400 hover:text-white bg-white/5' : 'text-gray-600 hover:text-gray-900 bg-black/5'"
            @click="toggle"
          >
            <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          <div class="flex items-center gap-1 rounded-full p-1" :class="isDark ? 'bg-white/5' : 'bg-black/5'">
            <button
              class="p-2 rounded-full transition-all duration-300"
              :class="viewMode === 'feed' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
              title="Feed view"
              @click="viewMode = 'feed'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              class="p-2 rounded-full transition-all duration-300"
              :class="viewMode === 'grid' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
              title="Grid view"
              @click="viewMode = 'grid'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect width="7" height="7" x="3" y="3" rx="1"/>
                <rect width="7" height="7" x="14" y="3" rx="1"/>
                <rect width="7" height="7" x="14" y="14" rx="1"/>
                <rect width="7" height="7" x="3" y="14" rx="1"/>
              </svg>
            </button>
          </div>
          <NuxtLink
            v-if="loggedIn"
            to="/admin"
            class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full hover:from-purple-400 hover:to-pink-400 transition-all duration-300 shadow-lg shadow-purple-500/25"
          >
            Admin
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="pb-12">
      <template v-if="viewMode === 'feed'">
        <div :class="isDark ? 'max-w-xl mx-auto divide-y divide-white/5' : 'max-w-xl mx-auto divide-y divide-black/5'">
          <article v-for="post in posts" :key="post.id" class="pb-6">
            <div class="flex items-center justify-between px-4 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                  <img v-if="config.avatarPath" :src="config.avatarPath" class="w-full h-full object-cover" />
                  <span v-else>{{ config.displayName.charAt(0).toUpperCase() }}</span>
                </div>
                <span class="font-semibold text-sm">{{ config.displayName }}</span>
              </div>
              <span class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">{{ formatDate(post.createdAt) }}</span>
            </div>
            <div class="relative group">
              <PostPhotoCarousel v-if="hasMultipleMedia(post)" :photos="getDisplayMedia(post)" />
              <video v-else-if="post.videoPath" :src="post.videoPath.path" class="w-full aspect-square object-cover" controls></video>
              <img v-else :src="getThumbnail(post)" class="w-full aspect-square object-cover" />
            </div>
            <div class="px-4 pt-3">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-sm bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{{ config.displayName }}</span>
                <button
                  class="flex items-center gap-1 text-sm hover:scale-110 transition-transform duration-200"
                  :class="isDark ? 'text-gray-400 hover:text-red-500' : 'text-gray-500 hover:text-red-600'"
                  @click.stop="heartPost(post)"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{{ post.heartCount || 0 }}</span>
                </button>
              </div>
              <p class="text-sm mt-1" :class="isDark ? 'text-gray-300' : 'text-gray-600'">{{ post.description }}</p>
            </div>
            <div class="px-4 pt-3 pb-4">
              <CommentSection :post-id="post.id" :is-dark="isDark" :comments-enabled="config.commentsEnabled" :comments-moderated="config.commentsModerated" />
            </div>
          </article>
          <div v-if="posts.length === 0" class="text-center py-20">
            <div :class="isDark ? 'w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center' : 'w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center'">
              <svg :class="isDark ? 'w-12 h-12 text-gray-600' : 'w-12 h-12 text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p :class="isDark ? 'text-gray-500' : 'text-gray-400'">No posts yet. Check back soon!</p>
          </div>
          <div v-if="hasMore" class="text-center py-8">
            <button
              class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:from-purple-400 hover:to-pink-400 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
              @click="loadMore"
            >
              Load More
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="max-w-5xl mx-auto px-6 py-6">
          <div class="grid grid-cols-3 gap-0.5 rounded-2xl overflow-hidden">
            <div
              v-for="post in posts"
              :key="post.id"
              :class="isDark ? 'aspect-square bg-gradient-to-br from-gray-800 to-gray-900 cursor-pointer relative group overflow-hidden' : 'aspect-square bg-gradient-to-br from-gray-200 to-gray-300 cursor-pointer relative group overflow-hidden'"
              @click="openPost(post)"
            >
              <video v-if="post.videoPath" :src="getThumbnail(post)" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" muted></video>
              <img v-else :src="getThumbnail(post)" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div v-if="hasMultipleMedia(post)" class="absolute top-2 right-2 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
                </svg>
              </div>
              <div v-else-if="post.videoPath" class="absolute top-2 right-2 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" ></div>
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="flex items-center gap-4 text-white">
                  <span class="flex items-center gap-1">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="posts.length === 0" class="text-center py-20">
            <div :class="isDark ? 'w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center' : 'w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center'">
              <svg :class="isDark ? 'w-12 h-12 text-gray-600' : 'w-12 h-12 text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p :class="isDark ? 'text-gray-500' : 'text-gray-400'">No posts yet. Check back soon!</p>
          </div>
          <div v-if="hasMore" class="text-center py-8">
            <button
              class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:from-purple-400 hover:to-pink-400 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
              @click="loadMore"
            >
              Load More
            </button>
          </div>
        </div>
      </template>
    </main>

    <Teleport to="body">
      <div
        v-if="selectedPost"
        class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="closePost"
      >
        <button
          class="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-200"
          @click="closePost"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl overflow-hidden" @click.stop>
          <PostPhotoCarousel v-if="hasMultipleMedia(selectedPost)" :photos="getDisplayMedia(selectedPost)" />
          <video v-else-if="selectedPost.videoPath" :src="selectedPost.videoPath.path" class="max-h-[90vh] max-w-[90vw] object-contain bg-black" controls></video>
          <img v-else :src="getThumbnail(selectedPost)" class="max-h-[90vh] max-w-[90vw] object-contain bg-black" />
        </div>
      </div>
    </Teleport>
  </div>
</template>