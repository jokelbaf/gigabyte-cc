import { invoke } from '@tauri-apps/api/core';

import type { FanCurvePoint, SystemInfo } from './types';

export const tauriApi = {
    getFanMode: () => invoke<number>('get_fan_mode'),
    setFanMode: (mode: number) => invoke<void>('set_fan_mode', { mode }),

    getFanCustomSpeed: () => invoke<number>('get_fan_custom_speed'),
    setFanCustomSpeed: (speed: number) => invoke<void>('set_fan_custom_speed', { speed }),

    getChargeMode: () => invoke<number>('get_charge_mode'),
    setChargeMode: (mode: number) => invoke<void>('set_charge_mode', { mode }),

    getChargeLimit: () => invoke<number>('get_charge_limit'),
    setChargeLimit: (limit: number) => invoke<void>('set_charge_limit', { limit }),

    getBatteryCycle: () => invoke<number>('get_battery_cycle'),

    getGpuBoost: () => invoke<number>('get_gpu_boost'),
    setGpuBoost: (mode: number) => invoke<void>('set_gpu_boost', { mode }),

    getUsbChargeS3: () => invoke<number>('get_usb_charge_s3'),
    getUsbChargeS4: () => invoke<number>('get_usb_charge_s4'),

    getFanCurvePoint: (index: number) => invoke<FanCurvePoint>('get_fan_curve_point', { index }),
    setFanCurvePoint: (index: number, temperature: number, speed: number) =>
        invoke<void>('set_fan_curve_point', { index, temperature, speed }),
    getAllFanCurvePoints: () => invoke<FanCurvePoint[]>('get_all_fan_curve_points'),

    getSystemInfo: () => invoke<SystemInfo>('get_system_info'),
};
