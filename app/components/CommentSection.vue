<script setup lang="ts">
interface Comment {
  id: number
  postId: number
  authorName: string
  content: string
  createdAt: Date | number
  isApproved?: boolean
}

const props = defineProps<{
  postId: number
  isDark: boolean
  commentsEnabled?: boolean
  commentsModerated?: boolean
}>()

const comments = ref<Comment[]>([])
const authorName = ref('')
const content = ref('')
const isSubmitting = ref(false)
const error = ref('')
const visibleCount = ref(3)
const isExpanded = ref(false)
const pendingMessage = ref('')

onMounted(() => {
  loadComments()
  const savedName = localStorage.getItem(`comment_author_${props.postId}`)
  if (savedName) {
    authorName.value = savedName
  }
})

async function loadComments() {
  try {
    const { items } = await $fetch<{ items: Comment[] }>(`/api/posts/${props.postId}/comments`)
    comments.value = items
  } catch {
    console.error('Failed to load comments')
  }
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

async function showMore() {
  visibleCount.value += 10
}

async function handleSubmit() {
  error.value = ''
  pendingMessage.value = ''

  if (!authorName.value.trim()) {
    error.value = 'Please enter your name'
    return
  }

  if (!content.value.trim()) {
    error.value = 'Please enter a comment'
    return
  }

  if (content.value.length > 2000) {
    error.value = 'Comment must be 2000 characters or less'
    return
  }

  isSubmitting.value = true

  try {
    const newComment = await $fetch<Comment>(`/api/posts/${props.postId}/comments`, {
      method: 'POST',
      body: { authorName: authorName.value.trim(), content: content.value.trim() }
    })
    localStorage.setItem(`comment_author_${props.postId}`, authorName.value.trim())
    
    if (props.commentsModerated) {
      comments.value.push({ ...newComment, isApproved: false })
      pendingMessage.value = 'Your comment is pending approval.'
    } else {
      comments.value.push(newComment)
    }
    content.value = ''
  } catch (e) {
    const err = e as { message?: string }
    error.value = err.message || 'Failed to post comment'
  } finally {
    isSubmitting.value = false
  }
}

function isPendingComment(comment: Comment): boolean {
  return comment.isApproved === false
}

function formatCommentDate(date: Date | number) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="mt-3">
    <button
      v-if="commentsEnabled !== false"
      class="flex items-center gap-2 text-sm transition-colors"
      :class="isDark ? 'text-gray-400 hover:text-purple-400' : 'text-gray-500 hover:text-purple-600'"
      @click="toggleExpanded"
    >
      <svg
        class="w-4 h-4 transition-transform duration-200"
        :class="isExpanded ? 'rotate-90' : ''"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span v-if="comments.length === 0">Add a comment</span>
      <span v-else>Comments ({{ comments.length }})</span>
    </button>

    <div v-if="isExpanded && commentsEnabled !== false" class="mt-3 space-y-3">
      <div v-if="comments.length > 0" class="space-y-3">
        <div
          v-for="comment in comments.slice(0, visibleCount)"
          :key="comment.id"
          :class="isDark ? 'bg-white/5 rounded-lg p-3' : 'bg-black/5 rounded-lg p-3'"
        >
          <div class="flex items-center gap-2">
            <span class="font-semibold text-sm" :class="isDark ? 'text-white' : 'text-gray-900'">
              {{ comment.authorName }}
            </span>
            <span class="text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-400'">
              {{ formatCommentDate(comment.createdAt) }}
            </span>
            <span
              v-if="isPendingComment(comment)"
              class="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded"
            >
              Pending
            </span>
          </div>
          <p class="text-sm mt-1" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
            {{ comment.content }}
          </p>
        </div>
        <button
          v-if="comments.length > visibleCount"
          class="text-sm text-purple-500 hover:text-purple-400 transition-colors"
          @click="showMore"
        >
          Show more... ({{ comments.length - visibleCount }} remaining)
        </button>
      </div>

      <div v-if="pendingMessage" class="text-sm text-yellow-500 bg-yellow-500/10 px-3 py-2 rounded-lg">
        {{ pendingMessage }}
      </div>

      <form class="space-y-2" @submit.prevent="handleSubmit">
        <input
          v-model="authorName"
          type="text"
          placeholder="Your name"
          maxlength="100"
          :class="isDark ? 'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500' : 'w-full px-3 py-2 bg-black/5 border border-black/10 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-purple-500'"
        />
        <textarea
          v-model="content"
          placeholder="Add a comment..."
          rows="2"
          maxlength="2000"
          :class="isDark ? 'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 resize-none' : 'w-full px-3 py-2 bg-black/5 border border-black/10 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-purple-500 resize-none'"
        ></textarea>
        <div class="flex items-center justify-between">
          <span
            v-if="error"
            class="text-xs text-red-500"
          >
            {{ error }}
          </span>
          <span
            v-else
            :class="isDark ? 'text-xs text-gray-500' : 'text-xs text-gray-400'"
          >
            {{ content.length }}/2000
          </span>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full hover:from-purple-400 hover:to-pink-400 transition-all duration-300 disabled:opacity-50"
          >
            {{ isSubmitting ? 'Posting...' : 'Post' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>