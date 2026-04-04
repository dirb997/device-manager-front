<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2 pb-2 border-b border-gray-200">
      <slot name="icon"></slot>
      <h2 class="text-lg font-semibold text-gray-800">{{ title }}</h2>
      <span class="ml-auto bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
        {{ devices.length }}
      </span>
    </div>
    
    <div v-if="devices.length === 0" class="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
      {{ emptyMessage }}
    </div>
    
    <div v-else class="grid gap-3">
      <DeviceCard 
        v-for="device in devices" 
        :key="device.id" 
        :device="device" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DeviceCard from './DeviceCard.vue';
import type { Device } from '../types/device';

defineProps<{
  title: string;
  devices: Device[];
  emptyMessage: string;
}>();
</script>