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
            {{ t('app.imeiOrSerial') }} {{ device.imei }}
            <span class="mx-1 text-slate-300">•</span>
            ID {{ device.id }}
          </p>
          <p class="mt-1 text-xs text-slate-500">{{ t('deviceCard.lastSeen') }} {{ lastSeenText }}</p>
        </div>
      </div>

      <div class="flex flex-col gap-3 lg:min-w-[270px] lg:items-end">
        <div class="flex flex-wrap items-center gap-2 lg:justify-end">
          <Badge variant="secondary">{{ t('deviceCard.battery') }} {{ batteryText }}</Badge>
          <Badge :variant="device.is_charging ? 'success' : 'outline'">
            {{ device.is_charging ? t('deviceCard.charging') : t('deviceCard.idle') }}
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
            {{ t('deviceCard.disconnect') }}
          </Button>
          <Badge v-else variant="secondary">{{ t('deviceCard.disconnected') }}</Badge>
        </div>
      </div>
    </div>

    <div class="mt-4 space-y-2">
      <div class="flex items-center justify-between text-xs text-slate-500">
        <span>{{ batteryText || t('deviceCard.noBatteryData') }}</span>
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
import { useI18n } from 'vue-i18n';
import Badge from './ui/Badge.vue';
import Button from './ui/Button.vue';
import type { Device } from '../types/device';
import { getDateFnsLocale } from '../i18n';

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

const { t, locale } = useI18n();

const connectionLabel = computed(() => {
  void locale.value;

  const labels: Record<Device['connection_type'], string> = {
    usb: t('deviceCard.usb'),
    bluetooth: t('deviceCard.bluetooth'),
    wifi: t('deviceCard.wifi'),
    manual: t('deviceCard.manual'),
    other: t('deviceCard.other'),
  };

  return labels[props.device.connection_type] ?? t('deviceCard.other');
});

const batteryLevel = computed(() => Math.max(0, Math.min(100, props.device.battery_level)));

const batteryText = computed(() => {
  if (props.device.battery_display) {
    return props.device.battery_display;
  }

  return props.device.battery_level > 0 ? `${props.device.battery_level}%` : t('deviceCard.unknown');
});

const statusLabel = computed(() => {
  if (props.device.status === 'connected') {
    return t('deviceCard.connected');
  }

  return props.device.battery_level < 20 ? t('deviceCard.needsAttention') : t('deviceCard.disconnected');
});

const statusBadgeVariant = computed(() => {
  if (props.device.status === 'connected') {
    return 'success' as const;
  }

  return props.device.battery_level < 20 ? 'danger' as const : 'warning' as const;
});

const lastSeenText = computed(() => formatDistanceToNow(new Date(props.device.last_seen), {
  addSuffix: true,
  locale: getDateFnsLocale(locale.value),
}));

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
