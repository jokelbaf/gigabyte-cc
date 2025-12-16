export interface FanCurvePoint {
    temperature: number;
    speed: number;
}

export interface SystemInfo {
    cpu_temp: number;
    gpu_temp: number;
    mb_temp: number;
    cpu_fan_rpm: number;
    gpu_fan_rpm: number;
}

export enum FanMode {
    Normal = 0,
    Silent = 1,
    Gaming = 2,
    Custom = 3,
    Auto = 4,
    Fixed = 5,
}

export enum ChargeMode {
    Normal = 0,
    Custom = 1,
}

export const FanModeLabels: Record<FanMode, string> = {
    [FanMode.Normal]: 'Normal',
    [FanMode.Silent]: 'Silent',
    [FanMode.Gaming]: 'Gaming',
    [FanMode.Custom]: 'Custom',
    [FanMode.Auto]: 'Auto',
    [FanMode.Fixed]: 'Fixed',
};
