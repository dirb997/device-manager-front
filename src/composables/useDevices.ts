import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import type { Device, BatteryUpdate } from '../types/device';

const API_URL = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/api/ws';

export function useDevices() {
  const devices = ref<Device[]>([]);
  const isLoading = ref(true);
  const ws = ref<WebSocket | null>(null);
  const error = ref<string | null>(null);
  let refreshTimer: number | null = null;

  const connectedDevices = computed(() => 
    devices.value.filter(d => d.status === 'connected')
  );
  
  const disconnectedDevices = computed(() => 
    devices.value.filter(d => d.status === 'disconnected')
  );

  const fetchDevices = async () => {
    try {
      isLoading.value = true;
      // Best-effort local scan (e.g., ADB) before fetching current DB state.
      await axios.post(`${API_URL}/devices/scan`).catch(() => undefined);
      const response = await axios.get<Device[]>(`${API_URL}/devices`);
      devices.value = response.data;
    } catch (err) {
      error.value = 'Failed to fetch devices';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const connectWebSocket = () => {
    const websocket = new WebSocket(WS_URL);
    
    websocket.onopen = () => {
      console.log('Connected to Device Manager');
    };
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'device_connected':
          devices.value = [
            ...devices.value.filter(d => d.id !== message.device.id),
            message.device
          ];
          break;
          
        case 'device_disconnected':
          devices.value = devices.value.map(d => 
            d.id === message.device_id 
              ? { ...d, status: 'disconnected' as const } 
              : d
          );
          break;
          
        case 'battery_update':
          devices.value = devices.value.map(d => 
            d.id === message.device_id 
              ? { 
                  ...d, 
                  battery_level: message.battery_level, 
                  is_charging: message.is_charging 
                } 
              : d
          );
          break;
      }
    };
    
    websocket.onclose = () => {
      console.log('Disconnected from Device Manager');
      // Attempt to reconnect after 1.5 seconds
      setTimeout(connectWebSocket, 1500);
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

  const disconnectDevice = async (deviceId: string) => {
    try {
      await axios.post(`${API_URL}/devices/${deviceId}/disconnect`);
    } catch (err) {
      console.error('Failed to disconnect device:', err);
    }
  };

  onMounted(() => {
    fetchDevices();
    connectWebSocket();
    refreshTimer = window.setInterval(fetchDevices, 10000);
  });

  onUnmounted(() => {
    ws.value?.close();
    if (refreshTimer !== null) {
      window.clearInterval(refreshTimer);
      refreshTimer = null;
    }
  });

  return {
    devices,
    connectedDevices,
    disconnectedDevices,
    isLoading,
    error,
    fetchDevices,
    sendBatteryUpdate,
    disconnectDevice
  };
}