<template>
  <div class="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-blue-50 rounded-lg">
          <Smartphone class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">{{ device.name }}</h3>
          <p class="text-xs text-gray-500 font-mono">IMEI: {{ device.imei }}</p>
        </div>
      </div>
      <StatusBadge :status="device.status" />
    </div>
    
    <div v-if="device.status === 'connected'" class="mt-4 flex items-center gap-4">
      <div :class="['flex items-center gap-2', batteryColorClass]">
        <BatteryCharging v-if="device.is_charging" class="w-5 h-5" />
        <Battery v-else class="w-5 h-5" />
        <span class="font-bold">{{ device.battery_level }}%</span>
      </div>
      <span v-if="device.is_charging" class="text-xs text-blue-600 font-medium">Charging</span>
    </div>
    
    <div class="mt-3 text-xs text-gray-400">
      Last seen: {{ lastSeenText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Battery, BatteryCharging, Smartphone } from 'lucide-vue-next';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from './StatusBadge.vue';
import type { Device } from '../types/device';

const props = defineProps<{
  device: Device
}>();

const batteryColorClass = computed(() => {
  const level = props.device.battery_level;
  if (level > 60) return 'text-green-600';
  if (level > 20) return 'text-yellow-600';
  return 'text-red-600';
});

const lastSeenText = computed(() => {
  return formatDistanceToNow(new Date(props.device.last_seen)) + ' ago';
});
</script>