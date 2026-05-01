export interface Device {
  id: string;
  name: string;
  imei: string;
  connection_type: 'usb' | 'bluetooth' | 'wifi' | 'manual' | 'other';
  status: 'connected' | 'disconnected' | 'unregistered';
  battery_level: number;
  battery_display: string;
  is_charging: boolean;
  last_seen: string;
  connected_at?: string;
  updated_at?: string;
}

export interface DeviceCreate {
  name: string;
  imei: string;
  connection_type: 'usb' | 'bluetooth' | 'wifi' | 'manual' | 'other';
  battery_level: number;
  battery_display?: string;
  is_charging: boolean;
}

export interface BatteryUpdate {
  device_id: string;
  battery_level: number;
  is_charging: boolean;
}

export interface UserPublic {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}