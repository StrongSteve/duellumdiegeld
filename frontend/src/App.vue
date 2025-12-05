<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import DisclaimerModal from '@/components/DisclaimerModal.vue'
import iPadFrame from '@/components/iPadFrame.vue'
import ServerWakeScreen from '@/components/ServerWakeScreen.vue'
import { useServerStatusStore } from '@/stores/serverStatus'

const serverStatus = useServerStatusStore()

onMounted(async () => {
  await serverStatus.connect()
})
</script>

<template>
  <!-- Loading/Wake screen while waiting for backend -->
  <ServerWakeScreen v-if="!serverStatus.isReady" />

  <!-- Main app content -->
  <template v-else>
    <DisclaimerModal />
    <iPadFrame>
      <RouterView />
    </iPadFrame>
  </template>
</template>
