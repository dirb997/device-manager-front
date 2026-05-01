<template>
  <section class="space-y-4">
    <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-sm">
      <div class="bg-slate-950 px-6 py-6 text-white">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.28em] text-slate-300">Operational overview</p>
            <h2 class="mt-2 text-3xl font-semibold tracking-tight">Device fleet health at a glance</h2>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Monitor connected devices, surface low battery devices quickly, and keep the registry synchronized with live scan updates.
            </p>
          </div>

          <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right backdrop-blur">
            <p class="text-[11px] uppercase tracking-[0.2em] text-slate-300">Last sync</p>
            <p class="mt-1 text-sm font-medium text-white">{{ lastSyncText }}</p>
          </div>
        </div>
      </div>

      <div class="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
        <article v-for="metric in metrics" :key="metric.label" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ metric.label }}</p>
          <p class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{{ metric.value }}</p>
          <p class="mt-2 text-sm text-slate-500">{{ metric.helper }}</p>
        </article>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h3 class="text-xl font-semibold tracking-tight text-slate-900">Health breakdown</h3>
            <p class="mt-1 text-sm text-slate-500">A compact view of where the fleet needs attention.</p>
          </div>
          <Badge variant="secondary">Score {{ healthScore }}</Badge>
        </div>

        <div class="mt-6 space-y-4">
          <div v-for="bar in overviewBars" :key="bar.label">
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="font-medium text-slate-700">{{ bar.label }}</span>
              <span class="text-slate-500">{{ bar.value }}%</span>
            </div>
            <div class="h-2 rounded-full bg-slate-100">
              <div class="h-2 rounded-full bg-slate-900 transition-all" :style="{ width: `${bar.value}%` }" />
            </div>
          </div>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          <div v-for="item in connectionSummary" :key="item.label" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ item.label }}</p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">{{ item.count }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h3 class="text-xl font-semibold tracking-tight text-slate-900">Recent activity</h3>
            <p class="mt-1 text-sm text-slate-500">Most recently seen devices from the registry.</p>
          </div>
          <Badge variant="outline">{{ recentDevices.length }}</Badge>
        </div>

        <div class="mt-6 space-y-3">
          <div
            v-for="device in recentDevices"
            :key="device.id"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-medium text-slate-900">{{ device.name }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ device.imei }}</p>
              </div>
              <Badge :variant="device.status === 'connected' ? 'success' : 'warning'">
                {{ device.status }}
              </Badge>
            </div>
            <p class="mt-3 text-xs text-slate-500">{{ formatSeen(device.last_seen) }}</p>
          </div>

          <div v-if="recentDevices.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No device activity yet.
          </div>
        </div>
      </div>
    </div>

    <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDistanceToNowStrict } from 'date-fns';
import Badge from './ui/Badge.vue';
import type { Device } from '../types/device';

const props = defineProps<{
  devices: Device[];
  lastSyncedAt: string | null;
  isRefreshing: boolean;
  error: string | null;
}>();

const totalDevices = computed(() => props.devices.length);

const connectedCount = computed(() => props.devices.filter((device) => device.status === 'connected').length);

const disconnectedCount = computed(() => props.devices.filter((device) => device.status !== 'connected').length);

const averageBattery = computed(() => {
  if (props.devices.length === 0) return 0;
  return props.devices.reduce((sum, device) => sum + device.battery_level, 0) / props.devices.length;
});

const lowBatteryCount = computed(() => props.devices.filter((device) => device.battery_level < 20).length);

const healthScore = computed(() => {
  if (props.devices.length === 0) return 100;
  const connectedRatio = connectedCount.value / props.devices.length;
  const weightedScore = connectedRatio * 70 + averageBattery.value * 0.3;
  return Math.max(0, Math.min(100, Math.round(weightedScore)));
});

const lastSyncText = computed(() => {
  if (!props.lastSyncedAt) {
    return props.isRefreshing ? 'syncing now' : 'waiting for first sync';
  }

  return `${formatDistanceToNowStrict(new Date(props.lastSyncedAt))} ago`;
});

const metrics = computed(() => [
  { label: 'Total devices', value: totalDevices.value, helper: 'Records in the registry' },
  { label: 'Connected', value: connectedCount.value, helper: 'Live and available now' },
  { label: 'Disconnected', value: disconnectedCount.value, helper: 'Kept for history' },
  { label: 'Low battery', value: lowBatteryCount.value, helper: 'Below 20%' },
]);

const overviewBars = computed(() => [
  { label: 'Connected coverage', value: props.devices.length === 0 ? 100 : Math.round((connectedCount.value / props.devices.length) * 100) },
  { label: 'Average battery', value: Math.round(averageBattery.value) },
  { label: 'Healthy devices', value: props.devices.length === 0 ? 100 : Math.round(((props.devices.length - lowBatteryCount.value) / props.devices.length) * 100) },
]);

const connectionSummary = computed(() => {
  const counts = {
    usb: 0,
    bluetooth: 0,
    wifi: 0,
    manual: 0,
    other: 0,
  };

  props.devices.forEach((device) => {
    counts[device.connection_type] += 1;
  });

  return [
    { label: 'USB', count: counts.usb },
    { label: 'Bluetooth', count: counts.bluetooth },
    { label: 'Wi-Fi', count: counts.wifi },
    { label: 'Manual', count: counts.manual + counts.other },
  ];
});

const recentDevices = computed(() =>
  [...props.devices]
    .sort((left, right) => new Date(right.last_seen).getTime() - new Date(left.last_seen).getTime())
    .slice(0, 4)
);

const formatSeen = (value: string) => `${formatDistanceToNowStrict(new Date(value))} ago`;
</script>
