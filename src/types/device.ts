export interface Device {
  id: string;
  name: string;
  imei: string;
  status: 'connected' | 'disconnected';
  battery_level: number;
  is_charging: boolean;
  last_seen: string;
  connected_at?: string;
}

export interface BatteryUpdate {
  device_id: string;
  battery_level: number;
  is_charging: boolean;
}