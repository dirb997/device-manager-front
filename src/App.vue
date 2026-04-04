<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Device Manager</h1>
            <p class="text-sm text-gray-500">Monitor connected devices and battery status</p>
          </div>
          <div class="flex gap-2">
            <div class="text-right">
              <div class="text-2xl font-bold text-green-600">{{ connectedDevices.length }}</div>
              <div class="text-xs text-gray-500">Connected</div>
            </div>
            <div class="w-px bg-gray-200 mx-2" />
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-600">{{ disconnectedDevices.length }}</div>
              <div class="text-xs text-gray-500">Disconnected</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-6">
      <div class="flex gap-2 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-4 py-2 rounded-lg font-medium capitalize transition-colors',
            activeTab === tab
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          ]"
        >
          {{ tab === 'all' ? 'All Devices' : tab }}
        </button>
      </div>

      <div class="space-y-8">
        <DeviceList
          v-if="activeTab === 'all' || activeTab === 'connected'"
          title="Connected Devices"
          :devices="activeTab === 'all' ? connectedDevices : connectedDevices"
          emptyMessage="No devices currently connected"
        >
          <template #icon>
            <Wifi class="w-5 h-5 text-green-600" />
          </template>
        </DeviceList>
        
        <DeviceList
          v-if="activeTab === 'all' || activeTab === 'disconnected'"
          title="Disconnected Devices"
          :devices="activeTab === 'all' ? disconnectedDevices : disconnectedDevices"
          emptyMessage="No disconnected devices"
        >
          <template #icon>
            <WifiOff class="w-5 h-5 text-gray-400" />
          </template>
        </DeviceList>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Wifi, WifiOff } from 'lucide-vue-next';
import { useDevices } from './composables/useDevices';
import DeviceList from './components/DeviceList.vue';

const { connectedDevices, disconnectedDevices } = useDevices();

type Tab = 'all' | 'connected' | 'disconnected';
const activeTab = ref<Tab>('all');
const tabs: Tab[] = ['all', 'connected', 'disconnected'];
</script>