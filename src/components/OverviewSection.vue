<template>
  <section class="max-w-6xl mx-auto">
    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-7">
      <div>
        <p class="text-[11px] uppercase tracking-[0.22em] text-[#8c9590] mb-2">System Status: Operational</p>
        <h1 class="text-4xl md:text-[2.6rem] leading-none font-semibold text-[#385f5c]">Hardware Overview</h1>
        <p class="mt-4 max-w-2xl text-sm text-[#6f7873] leading-6">
          Monitoring {{ totalDevices.toLocaleString() }} active nodes across global regions.
          System health is within optimal parameters with minor latencies detected in West-EU.
        </p>
      </div>

      <div class="rounded-xl border border-[#dde2dd] bg-[#f7f9f6] px-4 py-3 min-w-[210px]">
        <p class="text-[10px] uppercase tracking-[0.2em] text-[#8a9390]">Sync Status</p>
        <p class="text-sm font-semibold text-[#446965] mt-1">Last update {{ lastUpdateText }}</p>
      </div>
    </div>

    <div class="grid xl:grid-cols-[2.1fr_1fr] gap-5 mb-5">
      <section class="rounded-3xl border border-[#dfe3de] bg-white p-6 md:p-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-3xl md:text-[2.1rem] leading-none font-semibold text-[#1f2522]">Fleet Health Score</h2>
            <p class="text-sm text-[#7d8581] mt-2">Aggregate performance metric across all connected hardware</p>
          </div>
          <div class="w-16 h-16 rounded-full bg-[#d6eeea] text-[#3f7f76] flex items-center justify-center text-xl font-semibold">
            {{ healthScore }}
          </div>
        </div>

        <div class="mt-10 grid md:grid-cols-3 gap-5">
          <article v-for="metric in overviewPerformanceBars" :key="metric.label">
            <div class="flex justify-between text-[11px] uppercase tracking-[0.16em] mb-2 text-[#86908b]">
              <span>{{ metric.label }}</span>
              <span class="text-[#3f6762] font-semibold tracking-normal">{{ metric.value }}%</span>
            </div>
            <div class="h-1.5 rounded-full bg-[#d9dfda] overflow-hidden">
              <div class="h-full rounded-full bg-[#4b7672]" :style="{ width: `${metric.value}%` }" />
            </div>
          </article>
        </div>

        <div class="mt-12 flex flex-col sm:flex-row gap-3">
          <button class="px-5 py-3 rounded-xl bg-[#4f7d77] text-white font-medium hover:bg-[#456f69] transition shadow-sm">
            View Detailed Reports
          </button>
          <button class="px-5 py-3 rounded-xl border border-[#daddd7] bg-[#f5f6f3] text-[#44504a] font-medium hover:bg-[#ecefea] transition">
            Manage Topology
          </button>
        </div>
      </section>

      <section class="rounded-3xl border border-[#dfe3de] bg-[#f7f9f6] p-5 md:p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[1.55rem] leading-none font-semibold text-[#2c3330]">Critical Alerts</h3>
          <span class="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider bg-[#f9d9d3] text-[#af4d44]">
            {{ overviewAlerts.length }} active
          </span>
        </div>

        <div class="space-y-3.5">
          <article
            v-for="alert in overviewAlerts"
            :key="alert.id"
            class="rounded-2xl border border-[#e3e7e3] bg-white p-3.5"
          >
            <h4 class="text-sm font-semibold text-[#2f3532] leading-5">{{ alert.title }}</h4>
            <p class="text-xs text-[#7a8480] mt-1">{{ alert.detail }}</p>
          </article>
        </div>

        <button class="mt-4 text-xs uppercase tracking-[0.16em] text-[#3e726d] font-semibold">
          View all notifications
        </button>
      </section>
    </div>

    <div class="grid md:grid-cols-3 gap-5 mb-5">
      <article class="rounded-3xl border border-[#dfe3de] bg-[#f7f9f6] p-6">
        <p class="text-[10px] uppercase tracking-[0.22em] text-[#7e8782] font-semibold">Mobile</p>
        <p class="mt-5 text-[2.4rem] leading-none font-semibold text-[#313734]">{{ overviewDeviceTypeCounts.mobile }}</p>
        <p class="mt-2 text-xs text-[#7b8580]">Active handheld units</p>
        <div class="mt-4 h-[3px] w-14 rounded-full bg-[#4b7672]" />
      </article>

      <article class="rounded-3xl border border-[#dfe3de] bg-[#f7f9f6] p-6">
        <p class="text-[10px] uppercase tracking-[0.22em] text-[#7e8782] font-semibold">Desktop</p>
        <p class="mt-5 text-[2.4rem] leading-none font-semibold text-[#313734]">{{ overviewDeviceTypeCounts.desktop }}</p>
        <p class="mt-2 text-xs text-[#7b8580]">Fixed workstations and kiosks</p>
        <div class="mt-4 h-[3px] w-14 rounded-full bg-[#4b7672]" />
      </article>

      <article class="rounded-3xl border border-[#dfe3de] bg-[#f7f9f6] p-6">
        <p class="text-[10px] uppercase tracking-[0.22em] text-[#7e8782] font-semibold">Tablet</p>
        <p class="mt-5 text-[2.4rem] leading-none font-semibold text-[#313734]">{{ overviewDeviceTypeCounts.tablet }}</p>
        <p class="mt-2 text-xs text-[#7b8580]">Fleet inventory devices</p>
        <div class="mt-4 h-[3px] w-14 rounded-full bg-[#4b7672]" />
      </article>
    </div>

    <section class="rounded-3xl border border-[#dfe3de] bg-white overflow-hidden">
      <div class="px-6 pt-5">
        <h3 class="text-[2rem] leading-none font-semibold text-[#2e3431]">Regional Density</h3>
        <p class="text-sm text-[#7a8480] mt-1">Geographic distribution of the active fleet</p>
      </div>

      <div class="mt-4 px-6 py-5 flex items-end justify-end min-h-[220px] border-t border-[#e2e6e2] bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.65)_0_8%,transparent_40%),radial-gradient(circle_at_80%_35%,rgba(255,255,255,0.45)_0_8%,transparent_36%),repeating-radial-gradient(circle_at_20%_20%,#f0f1ed_0_4px,#e7ebe6_4px_8px),linear-gradient(120deg,#eceeea_0%,#e3e8e3_40%,#e8ebe7_100%)]">
        <div class="grid grid-cols-3 gap-7">
          <article v-for="region in overviewRegions" :key="region.name">
            <p class="text-3xl font-semibold text-[#2f3532] leading-none">{{ region.count }}</p>
            <p class="text-[10px] uppercase tracking-[0.16em] text-[#707a75] mt-2">{{ region.name }}</p>
          </article>
        </div>
      </div>
    </section>

    <p v-if="error" class="mt-4 text-sm text-[#b05248]">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDistanceToNowStrict } from 'date-fns';
import type { Device } from '../types/device';

const props = defineProps<{
  devices: Device[];
  error: string | null;
}>();

const totalDevices = computed(() => props.devices.length);

const connectedCount = computed(() =>
  props.devices.filter((device) => device.status === 'connected').length
);

const averageBattery = computed(() => {
  if (props.devices.length === 0) return 0;
  return props.devices.reduce((sum, device) => sum + device.battery_level, 0) / props.devices.length;
});

const healthScore = computed(() => {
  if (props.devices.length === 0) return 100;
  const connectedRatio = connectedCount.value / props.devices.length;
  const weightedScore = connectedRatio * 70 + averageBattery.value * 0.3;
  return Math.max(0, Math.min(100, Math.round(weightedScore)));
});

const lastUpdateText = computed(() => {
  const latest = [...props.devices].sort(
    (a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
  )[0];
  if (!latest) return 'just now';
  return `${formatDistanceToNowStrict(new Date(latest.last_seen))} ago`;
});

const overviewPerformanceBars = computed(() => {
  if (props.devices.length === 0) {
    return [
      { label: 'Uptime', value: 99.9 },
      { label: 'Efficiency', value: 84 },
      { label: 'Network', value: 92 }
    ];
  }

  const connectedRatio = connectedCount.value / props.devices.length;
  const uptime = Number((95 + connectedRatio * 4.9).toFixed(1));
  const efficiency = Math.round(Math.min(99, averageBattery.value * 0.7 + connectedRatio * 28));
  const network = Math.round(Math.min(99, 68 + connectedRatio * 24 + averageBattery.value * 0.1));

  return [
    { label: 'Uptime', value: uptime },
    { label: 'Efficiency', value: efficiency },
    { label: 'Network', value: network }
  ];
});

const overviewAlerts = computed(() => {
  const alerts: { id: string; title: string; detail: string }[] = [];

  for (const device of props.devices) {
    if (device.status === 'disconnected') {
      alerts.push({
        id: `${device.id}-offline`,
        title: `${device.name} Offline`,
        detail: `Connectivity lost ${formatDistanceToNowStrict(new Date(device.last_seen))} ago.`
      });
    } else if (device.battery_level < 20) {
      alerts.push({
        id: `${device.id}-battery`,
        title: `${device.name} Low Battery`,
        detail: `Battery at ${device.battery_level}%${device.is_charging ? ' and charging.' : '.'}`
      });
    }
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'all-stable',
      title: 'No Critical Events',
      detail: 'All monitored devices are operating within expected thresholds.'
    });
  }

  return alerts.slice(0, 3);
});

const overviewDeviceTypeCounts = computed(() => {
  const counts = { mobile: 0, desktop: 0, tablet: 0 };

  for (const device of props.devices) {
    const signal = `${device.name} ${device.id}`.toLowerCase();
    if (/(tablet|ipad|tab\b)/.test(signal)) {
      counts.tablet += 1;
    } else if (/(desktop|workstation|kiosk|imac|pc\b)/.test(signal)) {
      counts.desktop += 1;
    } else {
      counts.mobile += 1;
    }
  }

  return counts;
});

const overviewRegions = computed(() => {
  const regions = [
    { name: 'North America', count: 0 },
    { name: 'Europe', count: 0 },
    { name: 'Asia-Pacific', count: 0 }
  ];

  if (props.devices.length === 0) return regions;

  for (const device of props.devices) {
    const hash = device.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    regions[hash % 3].count += 1;
  }

  return regions;
});
</script>
