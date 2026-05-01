<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight text-slate-900">Device inventory</h2>
        <p class="mt-1 text-sm text-slate-500">Connected devices stay at the top. Disconnected devices are still retained in the registry.</p>
      </div>
      <Badge variant="secondary">{{ totalDevices }} shown</Badge>
    </div>

    <div v-if="devices.length === 0" class="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-10 text-center text-slate-500">
      No devices match the current filters.
    </div>

    <div v-else class="space-y-4">
      <section class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Connected</h3>
          <Badge variant="success">{{ connectedCount }}</Badge>
        </div>

        <div v-if="connectedDevices.length === 0" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No connected devices right now.
        </div>

        <div v-else class="space-y-3">
          <DeviceCard
            v-for="device in connectedDevices"
            :key="device.id"
            :device="device"
            :busy="busy"
            @disconnect="$emit('disconnect', $event)"
          />
        </div>
      </section>

      <section class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Disconnected</h3>
          <Badge variant="warning">{{ disconnectedCount }}</Badge>
        </div>

        <div v-if="disconnectedDevices.length === 0" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No disconnected devices in the current filter set.
        </div>

        <div v-else class="space-y-3">
          <DeviceCard
            v-for="device in disconnectedDevices"
            :key="device.id"
            :device="device"
            :busy="busy"
            @disconnect="$emit('disconnect', $event)"
          />
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Badge from './ui/Badge.vue';
import DeviceCard from './DeviceCard.vue';
import type { Device } from '../types/device';

const props = withDefaults(
  defineProps<{
    devices: Device[];
    totalDevices: number;
    busy?: boolean;
  }>(),
  {
    busy: false,
  }
);

defineEmits<{
  disconnect: [deviceId: string];
}>();

const connectedDevices = computed(() => props.devices.filter((device) => device.status === 'connected'));

const disconnectedDevices = computed(() => props.devices.filter((device) => device.status !== 'connected'));

const connectedCount = computed(() => connectedDevices.value.length);

const disconnectedCount = computed(() => disconnectedDevices.value.length);
</script>