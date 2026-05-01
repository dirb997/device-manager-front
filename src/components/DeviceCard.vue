<template>
  <article class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition-shadow hover:shadow-md">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex min-w-0 items-start gap-4">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
          <Smartphone class="h-5 w-5" />
        </div>

        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="truncate text-lg font-semibold text-slate-900">{{ device.name }}</h3>
            <Badge :variant="statusBadgeVariant">{{ statusLabel }}</Badge>
            <Badge variant="outline">{{ connectionLabel }}</Badge>
          </div>

          <p class="mt-1 text-sm text-slate-500">
            IMEI {{ device.imei }}
            <span class="mx-1 text-slate-300">•</span>
            ID {{ device.id }}
          </p>
          <p class="mt-1 text-xs text-slate-500">Last seen {{ lastSeenText }}</p>
        </div>
      </div>

      <div class="flex flex-col gap-3 lg:min-w-[270px] lg:items-end">
        <div class="flex flex-wrap items-center gap-2 lg:justify-end">
          <Badge variant="secondary">Battery {{ batteryText }}</Badge>
          <Badge :variant="device.is_charging ? 'success' : 'outline'">
            {{ device.is_charging ? 'Charging' : 'Idle' }}
          </Badge>
        </div>

        <div class="flex w-full items-center gap-2 lg:justify-end">
          <Button
            v-if="device.status === 'connected'"
            size="sm"
            variant="outline"
            :disabled="busy"
            @click="$emit('disconnect', device.id)"
          >
            Disconnect
          </Button>
          <Badge v-else variant="secondary">Disconnected</Badge>
        </div>
      </div>
    </div>

    <div class="mt-4 space-y-2">
      <div class="flex items-center justify-between text-xs text-slate-500">
        <span>{{ batteryText || 'No battery data' }}</span>
        <span>{{ batteryLevel }}%</span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-slate-100">
        <div :class="batteryBarClass" :style="{ width: `${batteryLevel}%` }" />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Smartphone } from 'lucide-vue-next';
import { formatDistanceToNow } from 'date-fns';
import Badge from './ui/Badge.vue';
import Button from './ui/Button.vue';
import type { Device } from '../types/device';

const props = withDefaults(
  defineProps<{
    device: Device;
    busy?: boolean;
  }>(),
  {
    busy: false,
  }
);

defineEmits<{
  disconnect: [deviceId: string];
}>();

const connectionLabel = computed(() => {
  const labels: Record<Device['connection_type'], string> = {
    usb: 'USB',
    bluetooth: 'Bluetooth',
    wifi: 'Wi-Fi',
    manual: 'Manual',
    other: 'Other',
  };

  return labels[props.device.connection_type] ?? 'Other';
});

const batteryLevel = computed(() => Math.max(0, Math.min(100, props.device.battery_level)));

const batteryText = computed(() => {
  if (props.device.battery_display) {
    return props.device.battery_display;
  }

  return props.device.battery_level > 0 ? `${props.device.battery_level}%` : 'Unknown';
});

const statusLabel = computed(() => {
  if (props.device.status === 'connected') {
    return 'Connected';
  }

  return props.device.battery_level < 20 ? 'Needs attention' : 'Disconnected';
});

const statusBadgeVariant = computed(() => {
  if (props.device.status === 'connected') {
    return 'success' as const;
  }

  return props.device.battery_level < 20 ? 'danger' as const : 'warning' as const;
});

const lastSeenText = computed(() => {
  return formatDistanceToNow(new Date(props.device.last_seen)) + ' ago';
});

const batteryBarClass = computed(() => {
  if (batteryLevel.value < 20) {
    return 'h-2 rounded-full bg-rose-500 transition-all';
  }

  if (batteryLevel.value < 50) {
    return 'h-2 rounded-full bg-amber-500 transition-all';
  }

  return 'h-2 rounded-full bg-emerald-500 transition-all';
});
</script>