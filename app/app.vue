<script setup lang="ts">
useUserSession()
const { dialog, handleConfirm, handleCancel } = useDialog()
</script>

<template>
  <div class="min-h-screen bg-black">
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <AppToast />
    <AppDialog
      :open="dialog.open"
      :title="dialog.title"
      :message="dialog.message"
      :confirm-text="dialog.confirmText"
      :cancel-text="dialog.cancelText"
      :danger="dialog.danger"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>