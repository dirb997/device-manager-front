<template>
  <span :class="['px-2 py-1 rounded-full text-xs font-medium border', colorClasses]">
    {{ status === 'connected' ? 'Connected' : 'Disconnected' }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: 'connected' | 'disconnected'
}>();

const colorClasses = computed(() => {
  return props.status === 'connected'
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-gray-100 text-gray-800 border-gray-200';
});
</script>