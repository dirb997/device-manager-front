<template>
  <div>
    <div class="hidden lg:grid grid-cols-[1.4fr_1.4fr_1.2fr_0.9fr] gap-4 px-4 pb-3 text-[11px] uppercase tracking-[0.16em] text-[#9ca49f]">
      <p>Forensic Identity</p>
      <p>Critical Network Data</p>
      <p>Device Properties (Metadata)</p>
      <p>Protection Status</p>
    </div>

    <div v-if="devices.length === 0" class="text-center py-10 text-[#8f9792] bg-white border border-[#e4e7e2] rounded-2xl">
      No forensic assets match your current filters
    </div>

    <div v-else class="space-y-3">
      <DeviceCard
        v-for="device in devices"
        :key="device.id"
        :device="device" 
      />
    </div>

    <div class="mt-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-[#6c7571]">
      <p>Showing {{ devices.length }} of {{ totalDevices }} forensic assets</p>
      <div class="flex items-center gap-1">
        <button
          class="px-3 py-1.5 rounded-lg border border-[#d9dcd7] bg-white hover:bg-[#f2f4f1] disabled:opacity-40"
          :disabled="page <= 1"
          @click="$emit('change-page', page - 1)"
        >
          Prev
        </button>
        <button
          v-for="pageNumber in visiblePages"
          :key="pageNumber"
          class="w-9 h-9 rounded-lg border text-sm"
          :class="pageNumber === page ? 'bg-[#4f7d77] border-[#4f7d77] text-white' : 'bg-white border-[#d9dcd7] hover:bg-[#f2f4f1]'"
          @click="$emit('change-page', pageNumber)"
        >
          {{ pageNumber }}
        </button>
        <button
          class="px-3 py-1.5 rounded-lg border border-[#d9dcd7] bg-white hover:bg-[#f2f4f1] disabled:opacity-40"
          :disabled="page >= totalPages"
          @click="$emit('change-page', page + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DeviceCard from './DeviceCard.vue';
import type { Device } from '../types/device';

const props = defineProps<{
  devices: Device[];
  totalDevices: number;
  page: number;
  totalPages: number;
}>();

defineEmits<{
  (event: 'change-page', page: number): void;
}>();

const visiblePages = computed(() => {
  const max = Math.min(5, props.totalPages);
  const start = Math.max(1, Math.min(props.page - 2, props.totalPages - max + 1));
  return Array.from({ length: max }, (_, i) => start + i);
});
</script>