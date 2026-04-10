<script setup lang="ts">
// AGENT: posts-admin
definePageMeta({ middleware: 'auth' })

const { clear } = useUserSession()
const { isDark, toggle, init } = useTheme()
const posts = ref<any[]>([])
const hasMore = ref(true)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const previewUrls = ref<string[]>([])
const description = ref('')
const uploading = ref(false)
const dragOver = ref(false)

const activeMenuPost = ref<number | null>(null)
const editingPost = ref<any>(null)
const editDescription = ref('')
const editDate = ref('')
const editFileInput = ref<HTMLInputElement | null>(null)
const editSelectedFiles = ref<File[]>([])
const editPreviewUrls = ref<string[]>([])
const showEditModal = ref(false)

const displayName = ref('')
const sitePassword = ref('')
const siteName = ref('')
const avatarPath = ref('')
const avatarFileInput = ref<HTMLInputElement | null>(null)
const savingDisplayName = ref(false)
const savingSitePassword = ref(false)
const savingSiteName = ref(false)
const savingAvatar = ref(false)

onMounted(() => {
  init()
  loadConfig()
})

async function loadPosts() {
  const { items, hasMore: more } = await $fetch<{ items: any[]; hasMore: boolean }>('/api/posts?limit=18&offset=0')
  posts.value = items
  hasMore.value = more
}

async function loadMorePosts() {
  const { items, hasMore: more } = await $fetch<{ items: any[]; hasMore: boolean }>(`/api/posts?limit=18&offset=${posts.value.length}`)
  posts.value.push(...items)
  hasMore.value = more
}

async function loadConfig() {
  const config = await $fetch<{ displayName: string; sitePassword?: string; siteName: string; avatarPath: string }>('/api/config')
  displayName.value = config.displayName
  sitePassword.value = config.sitePassword || ''
  siteName.value = config.siteName
  avatarPath.value = config.avatarPath || ''
}

async function saveDisplayName() {
  savingDisplayName.value = true
  try {
    await $fetch('/api/config', {
      method: 'PUT',
      body: { key: 'displayName', value: displayName.value }
    })
  } finally {
    savingDisplayName.value = false
  }
}

async function saveSitePassword() {
  savingSitePassword.value = true
  try {
    await $fetch('/api/config', {
      method: 'PUT',
      body: { key: 'sitePassword', value: sitePassword.value }
    })
  } finally {
    savingSitePassword.value = false
  }
}

async function saveSiteName() {
  savingSiteName.value = true
  try {
    await $fetch('/api/config', {
      method: 'PUT',
      body: { key: 'siteName', value: siteName.value }
    })
  } finally {
    savingSiteName.value = false
  }
}

async function saveAvatar() {
  savingAvatar.value = true
  try {
    const fd = new FormData()
    if (avatarFileInput.value?.files?.[0]) {
      fd.append('file', avatarFileInput.value.files[0])
    }
    const res = await $fetch<{ avatarPath: string }>('/api/admin/avatar', { method: 'POST', body: fd })
    avatarPath.value = res.avatarPath
  } finally {
    savingAvatar.value = false
  }
}
loadPosts()

function handleFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) addFiles(Array.from(files))
}

function handleDrop(e: DragEvent) {
  dragOver.value = false
  const files = e.dataTransfer?.files
  if (files) addFiles(Array.from(files))
}

function addFiles(files: File[]) {
  const imageFiles = files.filter(f => f.type.startsWith('image/'))
  const remaining = 10 - selectedFiles.value.length
  const toAdd = imageFiles.slice(0, remaining)
  for (const f of toAdd) {
    selectedFiles.value.push(f)
    previewUrls.value.push(URL.createObjectURL(f))
  }
}

function removeFile(index: number) {
  URL.revokeObjectURL(previewUrls.value[index])
  selectedFiles.value.splice(index, 1)
  previewUrls.value.splice(index, 1)
}

function moveFile(from: number, to: number) {
  if (to < 0 || to >= selectedFiles.value.length) return
  const files = selectedFiles.value
  const urls = previewUrls.value
  const tempF = files[from]
  const tempU = urls[from]
  files[from] = files[to]
  files[to] = tempF
  urls[from] = urls[to]
  urls[to] = tempU
  selectedFiles.value = [...files]
  previewUrls.value = [...urls]
}

function clearSelection() {
  for (const url of previewUrls.value) {
    URL.revokeObjectURL(url)
  }
  selectedFiles.value = []
  previewUrls.value = []
  description.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function publishPost() {
  if (selectedFiles.value.length === 0) return
  
  uploading.value = true
  try {
    const fd = new FormData()
    for (const file of selectedFiles.value) {
      fd.append('file', file)
    }
    const res = await $fetch<{ photoPaths: string[] }>('/api/admin/upload', { method: 'POST', body: fd })
    await $fetch('/api/posts', {
      method: 'POST',
      body: { photoPaths: res.photoPaths, description: description.value }
    })
    clearSelection()
    await loadPosts()
  } finally {
    uploading.value = false
  }
}

function toggleMenu(postId: number) {
  activeMenuPost.value = activeMenuPost.value === postId ? null : postId
}

function closeMenu() {
  activeMenuPost.value = null
}

function startEdit(post: any) {
  editingPost.value = post
  editDescription.value = post.description || ''
  editDate.value = post.createdAt ? new Date(post.createdAt).toISOString().slice(0, 16) : ''
  editSelectedFiles.value = []
  editPreviewUrls.value = []
  showEditModal.value = true
  activeMenuPost.value = null
}

function handleEditFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    const remaining = 10 - editSelectedFiles.value.length
    const toAdd = imageFiles.slice(0, remaining)
    for (const f of toAdd) {
      editSelectedFiles.value.push(f)
      editPreviewUrls.value.push(URL.createObjectURL(f))
    }
  }
}

function removeEditFile(index: number) {
  URL.revokeObjectURL(editPreviewUrls.value[index])
  editSelectedFiles.value.splice(index, 1)
  editPreviewUrls.value.splice(index, 1)
}

function moveEditFile(from: number, to: number) {
  if (to < 0 || to >= editSelectedFiles.value.length) return
  const files = editSelectedFiles.value
  const urls = editPreviewUrls.value
  const tempF = files[from]
  const tempU = urls[from]
  files[from] = files[to]
  files[to] = tempF
  urls[from] = urls[to]
  urls[to] = tempU
  editSelectedFiles.value = [...files]
  editPreviewUrls.value = [...urls]
}

async function saveEdit() {
  if (!editingPost.value) return
  
  uploading.value = true
  try {
    let photoPaths: string[] | undefined
    if (editSelectedFiles.value.length > 0) {
      const fd = new FormData()
      for (const file of editSelectedFiles.value) {
        fd.append('file', file)
      }
      const res = await $fetch<{ photoPaths: string[] }>('/api/admin/upload', { method: 'POST', body: fd })
      photoPaths = res.photoPaths
    }
    
    const body: { description: string; createdAt: string; photoPaths?: string[] } = {
      description: editDescription.value,
      createdAt: editDate.value
    }

    if (photoPaths) {
      body.photoPaths = photoPaths
    }
    
    await $fetch(`/api/posts/${editingPost.value.id}`, {
      method: 'PUT',
      body
    })
    
    for (const url of editPreviewUrls.value) {
      URL.revokeObjectURL(url)
    }
    editPreviewUrls.value = []
    editSelectedFiles.value = []
    showEditModal.value = false
    editingPost.value = null
    editDescription.value = ''
    editDate.value = ''
    await loadPosts()
  } finally {
    uploading.value = false
  }
}

async function deletePost(id: number) {
  if (!confirm('Delete this post?')) return
  await $fetch(`/api/posts/${id}`, { method: 'DELETE' })
  activeMenuPost.value = null
  await loadPosts()
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/admin/login')
}

function getEditPhotos(post: any) {
  if (post.photos && post.photos.length > 0) {
    return post.photos.sort((a: any, b: any) => a.orderIndex - b.orderIndex)
  }
  return [{ path: post.photoPath, orderIndex: 0 }]
}
</script>

<template>
  <div :class="isDark ? 'min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#0a0a0a] text-white' : 'min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 text-gray-900'">
    <input ref="editFileInput" type="file" accept="image/*" multiple class="hidden" @change="handleEditFileSelect" />
    
    <header :class="isDark ? 'sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10' : 'sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-black/10'">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
          {{ siteName }}
        </div>
        <div class="flex items-center gap-6">
          <button
            @click="toggle"
            class="p-2 rounded-full transition-all duration-300 hover:scale-110"
            :class="isDark ? 'text-gray-400 hover:text-white bg-white/5' : 'text-gray-600 hover:text-gray-900 bg-black/5'"
          >
            <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          <NuxtLink to="/" :class="isDark ? 'text-sm text-gray-400 hover:text-white transition-colors' : 'text-sm text-gray-600 hover:text-gray-900 transition-colors'">View Site</NuxtLink>
          <button @click="logout" :class="isDark ? 'text-sm text-gray-400 hover:text-white transition-colors' : 'text-sm text-gray-600 hover:text-gray-900 transition-colors'">Logout</button>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-10">
      <div class="mb-12">
        <h2 class="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Create Post</h2>
        
        <div v-if="selectedFiles.length === 0">
          <div
            class="relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden group"
            :class="[
              dragOver 
                ? 'border-pink-500 bg-pink-500/10 scale-[1.02]' 
                : isDark 
                  ? 'border-white/20 hover:border-white/40 hover:bg-white/5' 
                  : 'border-black/20 hover:border-black/40 hover:bg-black/5'
            ]"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="handleDrop"
            @click="fileInput?.click()"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />
            <div v-if="uploading" class="relative">
              <div class="w-16 h-16 mx-auto border-4 border-white/20 border-t-pink-500 rounded-full animate-spin" />
              <p class="text-gray-400 mt-4">Uploading...</p>
            </div>
            <div v-else class="relative space-y-4">
              <div class="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg :class="isDark ? 'w-10 h-10 text-gray-400 group-hover:text-pink-400 transition-colors' : 'w-10 h-10 text-gray-500 group-hover:text-pink-500 transition-colors'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p :class="isDark ? 'text-gray-300 mb-1' : 'text-gray-700 mb-1'">Drag & drop photos here</p>
                <p class="text-sm text-gray-500">or click to browse (up to 10 photos)</p>
              </div>
              <button
                @click.stop
                class="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
              >
                Choose Files
              </button>
            </div>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="grid grid-cols-5 gap-3">
            <div
              v-for="(url, index) in previewUrls"
              :key="index"
              class="relative aspect-square rounded-xl overflow-hidden bg-black group"
            >
              <img :src="url" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <button
                  v-if="index > 0"
                  @click="moveFile(index, index - 1)"
                  class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  v-if="index < previewUrls.length - 1"
                  @click="moveFile(index, index + 1)"
                  class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  @click="removeFile(index)"
                  class="w-8 h-8 bg-red-500/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-white text-xs font-medium">
                {{ index + 1 }}
              </div>
            </div>
            <div
              v-if="selectedFiles.length < 10"
              class="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-300"
              :class="isDark ? 'border-white/20 hover:border-white/40 hover:bg-white/5' : 'border-black/20 hover:border-black/40 hover:bg-black/5'"
              @click="fileInput?.click()"
            >
              <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />
              <svg :class="isDark ? 'w-8 h-8 text-gray-500' : 'w-8 h-8 text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          
          <textarea
            v-model="description"
            placeholder="Write a caption..."
            rows="3"
            :class="isDark 
              ? 'w-full px-5 py-4 bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 resize-none'
              : 'w-full px-5 py-4 bg-gradient-to-br from-gray-100 to-gray-200 border border-black/10 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 resize-none'"
          />
          
          <div class="flex gap-3">
            <button
              @click="clearSelection"
              class="flex-1 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300"
              :class="isDark ? 'text-white' : 'text-gray-900 bg-gray-200 hover:bg-gray-300'"
            >
              Cancel
            </button>
            <button
              @click="publishPost"
              :disabled="uploading"
              class="flex-1 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span v-if="uploading" class="flex items-center justify-center gap-2">
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing...
              </span>
              <span v-else>Publish</span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Settings</h2>
        <div :class="isDark ? 'p-6 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl space-y-6' : 'p-6 bg-gradient-to-br from-gray-100 to-white border border-black/10 rounded-2xl space-y-6'">
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <label :class="isDark ? 'text-sm text-gray-400' : 'text-sm text-gray-600'">Profile Avatar</label>
              <div class="mt-1 flex items-center gap-4">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <img v-if="avatarPath" :src="avatarPath" class="w-full h-full object-cover" />
                  <span v-else class="text-white text-xl font-bold">{{ displayName.charAt(0).toUpperCase() || 'A' }}</span>
                </div>
                <input ref="avatarFileInput" type="file" accept="image/*" class="hidden" @change="saveAvatar" />
                <button
                  @click="avatarFileInput?.click()"
                  :disabled="savingAvatar"
                  class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50"
                >
                  {{ savingAvatar ? 'Uploading...' : 'Upload Avatar' }}
                </button>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <label :class="isDark ? 'text-sm text-gray-400' : 'text-sm text-gray-600'">Site Name</label>
              <input
                v-model="siteName"
                type="text"
                placeholder="Enter site name..."
                :class="isDark 
                  ? 'w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all duration-300'
                  : 'w-full mt-1 px-4 py-3 bg-white border border-black/10 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all duration-300'"
              />
            </div>
            <button
              @click="saveSiteName"
              :disabled="savingSiteName"
              class="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50"
            >
              {{ savingSiteName ? 'Saving...' : 'Save' }}
            </button>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <label :class="isDark ? 'text-sm text-gray-400' : 'text-sm text-gray-600'">Display Name</label>
              <input
                v-model="displayName"
                type="text"
                placeholder="Enter display name..."
                :class="isDark 
                  ? 'w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all duration-300'
                  : 'w-full mt-1 px-4 py-3 bg-white border border-black/10 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all duration-300'"
              />
            </div>
            <button
              @click="saveDisplayName"
              :disabled="savingDisplayName"
              class="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50"
            >
              {{ savingDisplayName ? 'Saving...' : 'Save' }}
            </button>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <label :class="isDark ? 'text-sm text-gray-400' : 'text-sm text-gray-600'">Site Password</label>
              <input
                v-model="sitePassword"
                type="password"
                placeholder="Leave blank to disable..."
                :class="isDark 
                  ? 'w-full mt-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all duration-300'
                  : 'w-full mt-1 px-4 py-3 bg-white border border-black/10 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all duration-300'"
              />
            </div>
            <button
              @click="saveSitePassword"
              :disabled="savingSitePassword"
              class="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50"
            >
              {{ savingSitePassword ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-12">
        <h2 class="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Your Posts ({{ posts.length }})</h2>
        <div class="grid grid-cols-3 gap-3">
          <div 
            v-for="(post, index) in posts" 
            :key="post.id" 
            class="relative group aspect-square"
          >
            <div :class="isDark ? 'absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden' : 'absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden'">
              <img :src="post.photos && post.photos.length > 0 ? post.photos.sort((a, b) => a.orderIndex - b.orderIndex)[0].path : post.photoPath" class="w-full h-full object-cover" />
              <div v-if="post.photos && post.photos.length > 1" class="absolute top-2 right-2 w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
                </svg>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div 
              :class="[
                'absolute top-2 z-20',
                (index % 3 === 0) ? 'left-2 right-auto' : 'right-2 left-auto'
              ]"
            >
              <button
                @click.stop="toggleMenu(post.id)"
                class="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
              
              <div 
                v-if="activeMenuPost === post.id"
                :class="[
                  'absolute top-full mt-2 w-48 rounded-xl overflow-hidden shadow-2xl z-30',
                  (index % 3 === 0) ? 'left-0 right-auto' : 'right-0 left-auto'
                ]"
              >
                <div class="post-context-menu" :class="isDark ? 'bg-black border border-white/20' : 'bg-white border-black/20'">
                  <button
                    @click="startEdit(post)"
                    class="w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors"
                    :class="isDark ? 'text-white bg-gray-900 hover:bg-gray-700' : 'text-gray-900 bg-gray-50 hover:bg-gray-200'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    @click="deletePost(post.id)"
                    class="w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors text-red-500"
                    :class="isDark ? 'bg-gray-900 hover:bg-red-500/20' : 'bg-gray-50 hover:bg-red-50'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
            
            <p v-if="post.description" :class="[
              'absolute bottom-0 left-0 right-0 p-3 text-sm text-white/90 truncate z-10',
              'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300'
            ]">
              {{ post.description }}
            </p>
          </div>
          <div v-if="posts.length === 0" class="col-span-3 text-center py-20">
            <div :class="isDark ? 'w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center' : 'w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center'">
              <svg :class="isDark ? 'w-10 h-10 text-gray-600' : 'w-10 h-10 text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p :class="isDark ? 'text-gray-500' : 'text-gray-400'">No posts yet</p>
          </div>
          <div v-if="hasMore" class="col-span-3 text-center py-8">
            <button
              @click="loadMorePosts"
              class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:from-purple-400 hover:to-pink-400 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
            >
              Load More
            </button>
          </div>
        </div>
      </div>
    </main>

    <Teleport to="body">
      <div 
        v-if="showEditModal" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        :class="isDark ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/40 backdrop-blur-sm'"
        @click.self="showEditModal = false"
      >
        <div :class="isDark ? 'w-full max-w-lg bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 shadow-2xl' : 'w-full max-w-lg bg-gradient-to-br from-white to-gray-100 border border-black/10 rounded-2xl p-6 shadow-2xl'">
          <h3 class="text-xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Edit Post
          </h3>
          
          <div class="space-y-4">
            <div class="grid grid-cols-4 gap-2">
              <div
                v-for="(photo, index) in getEditPhotos(editingPost)"
                :key="photo.path"
                class="relative aspect-square rounded-lg overflow-hidden bg-black"
              >
                <img :src="photo.path" class="w-full h-full object-cover" />
                <div class="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-white text-xs">
                  {{ index + 1 }}
                </div>
              </div>
              <div
                v-for="(url, index) in editPreviewUrls"
                :key="'new-' + index"
                class="relative aspect-square rounded-lg overflow-hidden bg-black"
              >
                <img :src="url" class="w-full h-full object-cover" />
                <div class="absolute inset-0 flex items-center justify-center bg-black/40">
                  <button
                    @click="removeEditFile(index)"
                    class="w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <button
                v-if="editSelectedFiles.length < 10"
                @click="editFileInput?.click()"
                class="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center"
                :class="isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'"
              >
                <svg :class="isDark ? 'w-6 h-6 text-gray-500' : 'w-6 h-6 text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <textarea
              v-model="editDescription"
              placeholder="Write a caption..."
              rows="3"
              :class="isDark 
                ? 'w-full px-5 py-4 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all duration-300 resize-none'
                : 'w-full px-5 py-4 bg-gradient-to-br from-gray-100 to-gray-200 border border-black/10 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all duration-300 resize-none'"
            />
            
            <div>
              <label :class="isDark ? 'text-sm text-gray-400' : 'text-sm text-gray-600'">Date & Time</label>
              <input
                v-model="editDate"
                type="datetime-local"
                :class="isDark 
                  ? 'w-full mt-1 px-4 py-3 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pink-500/50 transition-all duration-300'
                  : 'w-full mt-1 px-4 py-3 bg-white border border-black/10 rounded-xl text-gray-900 focus:outline-none focus:border-pink-500/50 transition-all duration-300'"
              />
            </div>
            
            <div class="flex gap-3 pt-2">
              <button
                @click="showEditModal = false"
                class="flex-1 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
                :class="isDark ? 'text-white' : 'text-gray-900 bg-gray-200 hover:bg-gray-300'"
              >
                Cancel
              </button>
              <button
                @click="saveEdit"
                :disabled="uploading"
                class="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 disabled:opacity-50"
              >
                {{ uploading ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>