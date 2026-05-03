import { ref, computed } from 'vue';
import axios from 'axios';
import type { BatteryUpdate, Device, DeviceCreate } from '../types/device';
import { API_BASE_URL, TOKEN_STORAGE_KEY, WS_URL } from '../config/env';

const API_URL = API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function useDevices() {
  const devices = ref<Device[]>([]);
  const isLoading = ref(true);
  const isScanning = ref(false);
  const isSaving = ref(false);
  const ws = ref<WebSocket | null>(null);
  const error = ref<string | null>(null);
  const lastSyncedAt = ref<string | null>(null);
  let refreshTimer: number | null = null;
  let reconnectTimer: number | null = null;
  let shouldReconnect = true;

  const connectedDevices = computed(() => 
    devices.value.filter(d => d.status === 'connected')
  );
  
  const disconnectedDevices = computed(() => 
    devices.value.filter(d => d.status === 'disconnected')
  );

  const mergeDevice = (incoming: Device) => {
    const index = devices.value.findIndex((device) => device.id === incoming.id);

    if (index === -1) {
      devices.value = [incoming, ...devices.value];
      return;
    }

    const next = [...devices.value];
    next[index] = incoming;
    devices.value = next;
  };

  const shutdownRealtime = () => {
    shouldReconnect = false;

    if (refreshTimer !== null) {
      window.clearInterval(refreshTimer);
      refreshTimer = null;
    }

    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    ws.value?.close();
    ws.value = null;
  };

  const fetchDevices = async () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      isLoading.value = false;
      return;
    }

    try {
      isLoading.value = true;
      const response = await axios.get<Device[]>(`${API_URL}/devices`, { headers });
      devices.value = response.data;
      lastSyncedAt.value = new Date().toISOString();
    } catch (err) {
      error.value = 'Failed to load devices';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const scanDevices = async () => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      return;
    }

    try {
      isScanning.value = true;
      error.value = null;
      await axios.post(`${API_URL}/devices/scan`, {}, { headers });
    } catch (err) {
      error.value = 'Device scan failed';
      console.error(err);
    } finally {
      await fetchDevices();
      isScanning.value = false;
    }
  };

  const connectDevice = async (payload: DeviceCreate) => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      throw new Error('Missing authentication token');
    }

    try {
      isSaving.value = true;
      error.value = null;
      const response = await axios.post<Device>(`${API_URL}/devices/connect`, payload, { headers });
      mergeDevice(response.data);
      lastSyncedAt.value = new Date().toISOString();
      return response.data;
    } catch (err) {
      error.value = 'Failed to add device';
      console.error(err);
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  const disconnectDevice = async (deviceId: string) => {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      throw new Error('Missing authentication token');
    }

    try {
      isSaving.value = true;
      error.value = null;
      await axios.post(`${API_URL}/devices/${deviceId}/disconnect`, {}, { headers });
      await fetchDevices();
    } catch (err) {
      error.value = 'Failed to disconnect device';
      console.error(err);
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      return;
    }

    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      return;
    }

    shouldReconnect = true;

    const websocket = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
    
    websocket.onopen = () => {
      console.log('Connected to Device Manager');
    };
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'device_connected':
          mergeDevice(message.device);
          break;
          
        case 'device_disconnected':
          devices.value = devices.value.map(d => 
            d.id === message.device_id 
              ? { ...d, status: 'disconnected' as const, last_seen: new Date().toISOString() } 
              : d
          );
          break;
          
        case 'battery_update':
          devices.value = devices.value.map(d => 
            d.id === message.device_id 
              ? { 
                  ...d, 
                  battery_level: message.battery_level, 
                  is_charging: message.is_charging,
                  battery_display: message.battery_display ?? d.battery_display,
                } 
              : d
          );
          break;
      }
    };
    
    websocket.onclose = () => {
      console.log('Disconnected from Device Manager');
          ws.value = null;

          if (shouldReconnect && localStorage.getItem(TOKEN_STORAGE_KEY)) {
            reconnectTimer = window.setTimeout(connectWebSocket, 1500);
          }
    };
    
    websocket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
    
    ws.value = websocket;
  };

  const sendBatteryUpdate = (update: BatteryUpdate) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({
        type: 'battery_update',
        ...update
      }));
    }
  };

  const initializeDevices = async () => {
    shutdownRealtime();
    shouldReconnect = true;
    await fetchDevices();
    await scanDevices();

    if (refreshTimer !== null) {
      window.clearInterval(refreshTimer);
    }

    refreshTimer = window.setInterval(() => {
      void fetchDevices();
    }, 15000);

    connectWebSocket();
  };

  return {
    devices,
    connectedDevices,
    disconnectedDevices,
    isLoading,
    isScanning,
    isSaving,
    error,
    lastSyncedAt,
    fetchDevices,
    scanDevices,
    connectDevice,
    disconnectDevice,
    initializeDevices,
    shutdownRealtime,
    sendBatteryUpdate,
  };
}