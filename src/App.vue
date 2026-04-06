<template>
  <div class="min-h-screen app-shell lg:flex">
    <aside class="w-full lg:w-64 bg-[#f4f5f3] border-r border-[#e1e3de]">
      <div class="px-6 py-7 border-b border-[#e1e3de]">
        <p class="text-[#2f6b67] font-semibold tracking-wide">Ethos</p>
        <p class="text-[11px] uppercase tracking-[0.24em] text-[#8d9691]">Forensic Recovery</p>
      </div>

      <nav class="p-4 space-y-1 text-sm">
        <button class="w-full text-left px-4 py-2.5 rounded-lg text-[#5d6662] hover:bg-white transition">Overview</button>
        <button class="w-full text-left px-4 py-2.5 rounded-lg bg-white text-[#2f6b67] font-medium border border-[#dde5df] shadow-sm">Asset Inventory</button>
        <button class="w-full text-left px-4 py-2.5 rounded-lg text-[#5d6662] hover:bg-white transition">Recovery Ops</button>
        <button class="w-full text-left px-4 py-2.5 rounded-lg text-[#5d6662] hover:bg-white transition">Audit Logs</button>
      </nav>

      <div class="hidden lg:block mt-auto p-4 text-sm text-[#5d6662] space-y-1">
        <button class="w-full text-left px-4 py-2.5 rounded-lg hover:bg-white transition">Support</button>
        <button class="w-full text-left px-4 py-2.5 rounded-lg hover:bg-white transition">Sign Out</button>
      </div>
    </aside>

    <main class="flex-1 p-4 md:p-8">
      <section class="max-w-6xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
          <div>
            <p class="text-xs uppercase tracking-[0.16em] text-[#8c9590] mb-2">Forensics / Asset Management</p>
            <h1 class="text-4xl md:text-[2.6rem] leading-none font-semibold text-[#1d2421]">Device Inventory</h1>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <button class="px-5 py-3 rounded-xl border border-[#daddd7] bg-[#f5f6f3] text-[#44504a] font-medium hover:bg-[#ecefea] transition">
              Download Forensic Report
            </button>
            <button class="px-5 py-3 rounded-xl bg-[#4f7d77] text-white font-medium hover:bg-[#456f69] transition shadow-sm">
              Enroll Secure Asset
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
          <article class="metric-card">
            <p class="metric-label">Active Assets</p>
            <p class="metric-value">{{ stats.active }}</p>
          </article>
          <article class="metric-card">
            <p class="metric-label">Encrypted State</p>
            <p class="metric-value">{{ stats.encrypted }}</p>
            <p class="metric-subtag">{{ encryptedRate }}%</p>
          </article>
          <article class="metric-card">
            <p class="metric-label">Recovery Pending</p>
            <p class="metric-value">{{ stats.pending }}</p>
          </article>
          <article class="metric-card metric-danger">
            <p class="metric-label">Reported Stolen</p>
            <p class="metric-value">{{ stats.stolen }}</p>
          </article>
        </div>

        <section class="toolbar-panel mb-6">
          <div class="flex-1 min-w-[220px]">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search by IMEI, name, id, or serial..."
              class="w-full rounded-xl border border-[#dde1dc] bg-white px-4 py-3 text-sm text-[#2a302d] placeholder:text-[#9aa29d] focus:outline-none focus:ring-2 focus:ring-[#7ea7a2]/40"
            />
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <select v-model="securityFilter" class="toolbar-select">
              <option value="all">Security Tier: All</option>
              <option value="high">Security Tier: High</option>
              <option value="medium">Security Tier: Medium</option>
              <option value="low">Security Tier: Low</option>
            </select>

            <select v-model="sortBy" class="toolbar-select">
              <option value="risk">Sort: Risk Factor</option>
              <option value="recent">Sort: Last Seen</option>
              <option value="name">Sort: Device Name</option>
            </select>
          </div>
        </section>

        <DeviceList
          :devices="paginatedDevices"
          :total-devices="filteredDevices.length"
          :page="page"
          :total-pages="totalPages"
          @change-page="setPage"
        />

        <p v-if="error" class="mt-4 text-sm text-[#b05248]">{{ error }}</p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import DeviceList from './components/DeviceList.vue';
import { useDevices } from './composables/useDevices';
import type { Device } from './types/device';

type SecurityTier = 'high' | 'medium' | 'low';
type SecurityFilter = SecurityTier | 'all';
type SortMode = 'risk' | 'recent' | 'name';

const { devices, error } = useDevices();
const searchQuery = ref('');
const securityFilter = ref<SecurityFilter>('all');
const sortBy = ref<SortMode>('risk');
const page = ref(1);
const pageSize = 4;

const safetyRank = (device: Device) => {
  if (device.status === 'disconnected' && device.battery_level < 15) return 0;
  if (device.status === 'disconnected') return 1;
  if (device.battery_level < 35) return 2;
  return 3;
};

const getSecurityTier = (device: Device): SecurityTier => {
  if (device.status === 'disconnected') return 'low';
  if (device.battery_level < 35) return 'medium';
  return 'high';
};

const filteredDevices = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return [...devices.value]
    .filter((device) => {
      if (!query) return true;
      return [device.name, device.id, device.imei].some((value) =>
        value.toLowerCase().includes(query)
      );
    })
    .filter((device) => {
      if (securityFilter.value === 'all') return true;
      return getSecurityTier(device) === securityFilter.value;
    })
    .sort((a, b) => {
      if (sortBy.value === 'name') return a.name.localeCompare(b.name);
      if (sortBy.value === 'recent') {
        return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime();
      }
      return safetyRank(a) - safetyRank(b);
    });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredDevices.value.length / pageSize)));

const paginatedDevices = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredDevices.value.slice(start, start + pageSize);
});

const stats = computed(() => {
  const list = devices.value;
  return {
    active: list.length,
    encrypted: list.filter((d) => d.status === 'connected').length,
    pending: list.filter((d) => d.status === 'disconnected' && d.battery_level >= 15).length,
    stolen: list.filter((d) => d.status === 'disconnected' && d.battery_level < 15).length
  };
});

const encryptedRate = computed(() => {
  if (stats.value.active === 0) return '0.0';
  return ((stats.value.encrypted / stats.value.active) * 100).toFixed(1);
});

watch([filteredDevices, totalPages], () => {
  if (page.value > totalPages.value) {
    page.value = totalPages.value;
  }
});

const setPage = (nextPage: number) => {
  if (nextPage < 1 || nextPage > totalPages.value) return;
  page.value = nextPage;
};
</script>