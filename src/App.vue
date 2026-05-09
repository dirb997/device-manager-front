<template>
  <LoginPage
    v-if="!isAuthenticated"
    :loading="isAuthenticating"
    :error="authError"
    @login="handleLogin"
    @register="handleRegister"
  />

  <div v-else class="min-h-screen px-4 py-4 md:px-6 md:py-6">
    <div class="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside class="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            DM
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-900">{{ t('app.title') }}</p>
            <p class="text-xs text-slate-500">{{ t('app.subtitle') }}</p>
          </div>
        </div>

        <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ t('app.signedInAs') }}</p>
          <p class="mt-2 truncate text-sm font-medium text-slate-900">
            {{ currentUser?.email ?? t('app.loadingProfile') }}
          </p>
        </div>

        <div class="mt-5 space-y-2">
          <Button class="w-full justify-start" :variant="currentView === 'overview' ? 'default' : 'outline'" @click="currentView = 'overview'">
            {{ t('app.overviewNav') }}
          </Button>
          <Button class="w-full justify-start" :variant="currentView === 'devices' ? 'default' : 'outline'" @click="currentView = 'devices'">
            {{ t('app.devicesNav') }}
          </Button>
        </div>

        <Separator class="my-5" />

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">{{ t('app.total') }}</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ stats.total }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">{{ t('app.connected') }}</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ stats.connected }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">{{ t('app.offline') }}</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ stats.disconnected }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">{{ t('app.lowBattery') }}</p>
              <p class="mt-2 text-2xl font-semibold text-slate-900">{{ stats.lowBattery }}</p>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {{ statusMessage || t('app.statusMessage') }}
          </div>
        </div>

        <Separator class="my-5" />

        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{{ t('app.quickAddTitle') }}</h3>
            <p class="mt-1 text-sm text-slate-500">{{ t('app.quickAddCopy') }}</p>
          </div>

          <form class="space-y-3" @submit.prevent="handleCreateDevice">
            <Input v-model="newDeviceName" :placeholder="t('app.deviceName')" />
            <Input v-model="newDeviceImei" :placeholder="t('app.imeiOrSerial')" />

            <Select v-model="newDeviceConnectionType">
              <option value="manual">{{ t('deviceCard.manual') }}</option>
              <option value="usb">{{ t('deviceCard.usb') }}</option>
              <option value="bluetooth">{{ t('deviceCard.bluetooth') }}</option>
              <option value="wifi">{{ t('deviceCard.wifi') }}</option>
              <option value="other">{{ t('deviceCard.other') }}</option>
            </Select>

            <Input v-model="newDeviceBatteryLevel" type="number" min="0" max="100" :placeholder="t('app.batteryLevel')" />

            <label class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <input v-model="newDeviceCharging" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
              {{ t('app.charging') }}
            </label>

            <Button type="submit" class="w-full" :disabled="isSaving || isScanning">{{ t('app.addDevice') }}</Button>
          </form>
        </div>

        <Separator class="my-5" />

        <div class="space-y-2">
          <Button class="w-full" variant="outline" :disabled="isLoading || isScanning" @click="handleScan">
            {{ isScanning ? t('app.scanning') : t('app.scanLocalDevices') }}
          </Button>
          <Button class="w-full" variant="outline" :disabled="isLoading || isScanning" @click="handleRefresh">
            {{ t('app.refreshRegistry') }}
          </Button>
          <Button class="w-full" variant="ghost" @click="handleLogout">{{ t('app.signOut') }}</Button>
        </div>
      </aside>

      <main class="space-y-4">
        <div class="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.28em] text-slate-500">{{ t('app.shellTitle') }}</p>
            <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {{ currentView === 'overview' ? t('app.currentViewOverviewTitle') : t('app.currentViewDevicesTitle') }}
            </h1>
            <p class="mt-1 text-sm text-slate-500">
              {{ currentView === 'overview' ? t('app.currentViewOverviewCopy') : t('app.currentViewDevicesCopy') }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <Button variant="outline" :disabled="isLoading || isScanning" @click="handleRefresh">
              {{ t('app.refresh') }}
            </Button>
            <Button :disabled="isLoading || isScanning" @click="handleScan">
              {{ t('app.scanDevices') }}
            </Button>
          </div>
        </div>

        <OverviewSection
          v-if="currentView === 'overview'"
          :devices="devices"
          :last-synced-at="lastSyncedAt"
          :is-refreshing="isLoading"
          :error="error"
        />

        <section v-else class="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <div class="space-y-4">
            <Card class="p-5">
              <div class="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_180px_180px_180px]">
                <Input v-model="searchQuery" :placeholder="t('app.searchPlaceholder')" />

                <Select v-model="statusFilter">
                  <option value="all">{{ t('app.allStatuses') }}</option>
                  <option value="connected">{{ t('app.connected') }}</option>
                  <option value="disconnected">{{ t('app.offline') }}</option>
                </Select>

                <Select v-model="connectionFilter">
                  <option value="all">{{ t('app.allConnections') }}</option>
                  <option value="usb">{{ t('deviceCard.usb') }}</option>
                  <option value="bluetooth">{{ t('deviceCard.bluetooth') }}</option>
                  <option value="wifi">{{ t('deviceCard.wifi') }}</option>
                  <option value="manual">{{ t('deviceCard.manual') }}</option>
                  <option value="other">{{ t('deviceCard.other') }}</option>
                </Select>

                <Select v-model="sortBy">
                  <option value="recent">{{ t('app.sortRecent') }}</option>
                  <option value="name">{{ t('app.sortName') }}</option>
                  <option value="battery">{{ t('app.sortBattery') }}</option>
                </Select>
              </div>

              <div class="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
                <Badge variant="secondary">{{ filteredDevices.length }} {{ t('app.filtered') }}</Badge>
                <Badge variant="outline">{{ connectedFilteredDevices.length }} {{ t('app.connectedCount') }}</Badge>
                <Badge variant="outline">{{ disconnectedFilteredDevices.length }} {{ t('app.disconnectedCount') }}</Badge>
              </div>
            </Card>

            <DeviceList
              :devices="filteredDevices"
              :total-devices="filteredDevices.length"
              :busy="isSaving || isScanning"
              @disconnect="handleDisconnect"
            />
          </div>

          <Card class="p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-semibold tracking-tight text-slate-900">{{ t('app.registryNotesTitle') }}</h3>
                <p class="mt-1 text-sm text-slate-500">{{ t('app.registryNotesCopy') }}</p>
              </div>
              <Badge variant="secondary">{{ t('app.liveAndAvailable') }}</Badge>
            </div>

            <div class="mt-5 space-y-3 text-sm text-slate-600">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                {{ t('app.registryNoteOne') }}
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                {{ t('app.registryNoteTwo') }}
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                {{ t('app.registryNoteThree') }}
              </div>
            </div>
          </Card>
        </section>

        <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import Badge from './components/ui/Badge.vue';
import Button from './components/ui/Button.vue';
import Card from './components/ui/Card.vue';
import Input from './components/ui/Input.vue';
import Select from './components/ui/Select.vue';
import Separator from './components/ui/Separator.vue';
import DeviceList from './components/DeviceList.vue';
import LoginPage from './components/LoginPage.vue';
import OverviewSection from './components/OverviewSection.vue';
import { AUTH_API_URL, TOKEN_STORAGE_KEY } from './config/env';
import { useDevices } from './composables/useDevices';
import { getStoredLocale, setLocale, type LocaleCode } from './i18n';
import type { DeviceCreate, UserPublic } from './types/device';

type StatusFilter = 'all' | 'connected' | 'disconnected';
type ConnectionFilter = 'all' | DeviceCreate['connection_type'];
type SortMode = 'recent' | 'name' | 'battery';

const {
  devices,
  error,
  isLoading,
  isScanning,
  isSaving,
  lastSyncedAt,
  fetchDevices,
  scanDevices,
  connectDevice,
  disconnectDevice,
  initializeDevices,
  shutdownRealtime,
} = useDevices();

const { t } = useI18n();

const currentView = ref<'overview' | 'devices'>('overview');
const isAuthenticated = ref(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));
const isAuthenticating = ref(false);
const authError = ref('');
const currentUser = ref<UserPublic | null>(null);
const statusMessage = ref('');

const searchQuery = ref('');
const statusFilter = ref<StatusFilter>('all');
const connectionFilter = ref<ConnectionFilter>('all');
const sortBy = ref<SortMode>('recent');

const newDeviceName = ref('');
const newDeviceImei = ref('');
const newDeviceConnectionType = ref<DeviceCreate['connection_type']>('manual');
const newDeviceBatteryLevel = ref('100');
const newDeviceCharging = ref(false);

const stats = computed(() => ({
  total: devices.value.length,
  connected: devices.value.filter((device) => device.status === 'connected').length,
  disconnected: devices.value.filter((device) => device.status === 'disconnected').length,
  lowBattery: devices.value.filter((device) => device.battery_level < 20).length,
}));

const filteredDevices = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return [...devices.value]
    .filter((device) => {
      if (!query) return true;
      return [device.name, device.id, device.imei].some((value) => value.toLowerCase().includes(query));
    })
    .filter((device) => {
      if (statusFilter.value === 'all') return true;
      return device.status === statusFilter.value;
    })
    .filter((device) => {
      if (connectionFilter.value === 'all') return true;
      return device.connection_type === connectionFilter.value;
    })
    .sort((left, right) => {
      if (sortBy.value === 'name') {
        return left.name.localeCompare(right.name);
      }

      if (sortBy.value === 'battery') {
        return right.battery_level - left.battery_level;
      }

      return new Date(right.last_seen).getTime() - new Date(left.last_seen).getTime();
    });
});

const connectedFilteredDevices = computed(() => filteredDevices.value.filter((device) => device.status === 'connected'));
const disconnectedFilteredDevices = computed(() => filteredDevices.value.filter((device) => device.status !== 'connected'));

const authHeaders = () => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const finishSession = (silent = false) => {
  shutdownRealtime();
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  isAuthenticated.value = false;
  currentUser.value = null;
  currentView.value = 'overview';

  if (!silent) {
    statusMessage.value = '';
  }
};

const handleLogin = async (credentials: { email: string; password: string }) => {
  authError.value = '';

  if (!credentials.email || !credentials.password) {
    authError.value = t('auth.completeAllFields');
    return;
  }

  isAuthenticating.value = true;

  try {
    const response = await axios.post(`${AUTH_API_URL}/login`, credentials);
    localStorage.setItem(TOKEN_STORAGE_KEY, response.data.access_token);
    currentUser.value = response.data.user;
    setLocale(currentUser.value?.language ?? getStoredLocale());
    isAuthenticated.value = true;
    currentView.value = 'overview';
    statusMessage.value = t('auth.signingInSuccessfully');
    await initializeDevices();
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      authError.value = (err.response?.data?.detail as string) || t('auth.loginFailed');
    } else {
      authError.value = t('auth.loginFailed');
    }
  } finally {
    isAuthenticating.value = false;
  }
};

const handleRegister = async (credentials: { email: string; password: string; confirmPassword: string; language: LocaleCode }) => {
  authError.value = '';

  if (!credentials.email || !credentials.password || !credentials.confirmPassword) {
    authError.value = t('auth.completeAllFields');
    return;
  }

  if (credentials.password !== credentials.confirmPassword) {
    authError.value = t('auth.passwordsDoNotMatch');
    return;
  }

  isAuthenticating.value = true;

  try {
    setLocale(credentials.language);
    await axios.post(`${AUTH_API_URL}/register`, {
      email: credentials.email,
      password: credentials.password,
      language: credentials.language,
    });
    await handleLogin({ email: credentials.email, password: credentials.password });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      authError.value = (err.response?.data?.detail as string) || t('auth.registrationFailed');
    } else {
      authError.value = t('auth.registrationFailed');
    }
  } finally {
    isAuthenticating.value = false;
  }
};

const handleLogout = async (silent = false) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    await axios
      .post(
        `${AUTH_API_URL}/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .catch(() => undefined);
  }

  finishSession(silent);
};

const loadCurrentUser = async () => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    return false;
  }

  try {
    const response = await axios.get<UserPublic>(`${AUTH_API_URL}/me`, { headers: authHeaders() });
    currentUser.value = response.data;
    setLocale(currentUser.value?.language ?? getStoredLocale());
    return true;
  } catch {
    await handleLogout(true);
    return false;
  }
};

const handleRefresh = async () => {
  await fetchDevices();
  statusMessage.value = t('app.registryRefreshed');
};

const handleScan = async () => {
  await scanDevices();
  statusMessage.value = t('app.localScanComplete');
};

const handleDisconnect = async (deviceId: string) => {
  try {
    await disconnectDevice(deviceId);
    statusMessage.value = t('app.deviceDisconnected');
  } catch {
    statusMessage.value = t('app.unableToDisconnectDevice');
  }
};

const handleCreateDevice = async () => {
  const name = newDeviceName.value.trim();
  const imei = newDeviceImei.value.trim();

  if (!name || !imei) {
    statusMessage.value = t('app.manualDeviceRequiresNameAndImei');
    return;
  }

  const batteryLevel = Number(newDeviceBatteryLevel.value);

  try {
    await connectDevice({
      name,
      imei,
      connection_type: newDeviceConnectionType.value,
      battery_level: Number.isFinite(batteryLevel) ? Math.max(0, Math.min(100, batteryLevel)) : 0,
      is_charging: newDeviceCharging.value,
    });

    newDeviceName.value = '';
    newDeviceImei.value = '';
    newDeviceConnectionType.value = 'manual';
    newDeviceBatteryLevel.value = '100';
    newDeviceCharging.value = false;
    statusMessage.value = t('app.deviceAddedToRegistry');
  } catch {
    statusMessage.value = t('app.unableToAddDevice');
  }
};

const bootstrap = async () => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    return;
  }

  isAuthenticated.value = true;
  const valid = await loadCurrentUser();

  if (valid) {
    await initializeDevices();
  }
};

onMounted(() => {
  void bootstrap();
});
</script>
