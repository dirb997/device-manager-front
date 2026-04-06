<template>
  <article class="bg-white border border-[#e4e7e2] rounded-2xl p-4 md:p-5 hover:shadow-sm transition-shadow">
    <div class="grid lg:grid-cols-[1.4fr_1.4fr_1.2fr_0.9fr] gap-5 items-center">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-gradient-to-b from-[#7f8e89] to-[#3a4341] flex items-center justify-center shadow-inner">
          <Smartphone class="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 class="font-semibold text-[#1f2522]">{{ device.name }}</h3>
          <p class="text-[11px] tracking-wide text-[#8f9792]">ID: {{ device.id }}</p>
        </div>
      </div>

      <div class="space-y-1 text-[12px]">
        <p class="text-[#707873]"><span class="text-[#9aa29d]">IMEI:</span> {{ device.imei }}</p>
        <p class="text-[#707873]"><span class="text-[#9aa29d]">MAC:</span> {{ macAddress }}</p>
        <p class="text-[#707873]"><span class="text-[#9aa29d]">Serial:</span> {{ serial }}</p>
      </div>

      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs">
          <span class="meta-pill">Battery: {{ device.battery_level }}%</span>
          <span class="meta-pill">{{ device.is_charging ? 'Charging' : 'Idle' }}</span>
        </div>
        <p class="text-[11px] text-[#8f9792]">Last seen {{ lastSeenText }}</p>
      </div>

      <div class="flex flex-col items-start lg:items-end gap-2">
        <StatusBadge :status="device.status" :battery-level="device.battery_level" />
        <button
          class="w-full lg:w-auto px-3 py-2 rounded-lg text-xs font-medium transition"
          :class="actionButtonClass"
        >
          {{ actionText }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Smartphone } from 'lucide-vue-next';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from './StatusBadge.vue';
import type { Device } from '../types/device';

const props = defineProps<{
  device: Device
}>();

const serial = computed(() => {
  return props.device.id.split('-').slice(0, 3).join('-').toUpperCase();
});

const macAddress = computed(() => {
  const normalized = props.device.imei.replace(/[^0-9A-Fa-f]/g, '').slice(0, 12).padEnd(12, '0');
  return normalized.match(/.{1,2}/g)?.join(':').toUpperCase() ?? '00:00:00:00:00:00';
});

const lastSeenText = computed(() => {
  return formatDistanceToNow(new Date(props.device.last_seen)) + ' ago';
});

const actionText = computed(() => {
  if (props.device.status === 'disconnected' && props.device.battery_level < 15) {
    return 'Export Case File';
  }
  if (props.device.status === 'disconnected') {
    return 'Report As Stolen';
  }
  return 'Mark For Recovery';
});

const actionButtonClass = computed(() => {
  if (props.device.status === 'disconnected' && props.device.battery_level < 15) {
    return 'bg-[#c96558] text-white hover:bg-[#b95a4f]';
  }
  return 'bg-[#f3f5f2] text-[#55605b] hover:bg-[#e7ebe6]';
});
</script>