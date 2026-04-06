<template>
  <span :class="['px-2.5 py-1 rounded-full text-[11px] tracking-wide font-semibold border uppercase', colorClasses]">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: 'connected' | 'disconnected';
  batteryLevel: number;
}>();

const label = computed(() => {
  if (props.status === 'disconnected' && props.batteryLevel < 15) {
    return 'Stolen';
  }
  if (props.status === 'disconnected') {
    return 'Warning';
  }
  return 'Encrypted';
});

const colorClasses = computed(() => {
  if (props.status === 'disconnected' && props.batteryLevel < 15) {
    return 'bg-[#f8d8d4] text-[#b05044] border-[#efc2bc]';
  }
  if (props.status === 'disconnected') {
    return 'bg-[#f8efe2] text-[#9a7347] border-[#efd8be]';
  }
  return 'bg-[#dff2ee] text-[#3f7f76] border-[#c3e6df]';
});
</script>