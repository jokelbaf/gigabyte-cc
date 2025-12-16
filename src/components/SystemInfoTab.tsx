import { useCallback, useEffect, useState } from 'react';
import { Activity, Fan, Gauge, Thermometer } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { tauriApi } from '@/lib/tauri';
import { useToast } from '@/lib/toast-provider';
import type { SystemInfo } from '@/lib/types';

export function SystemInfoTab() {
    const [systemInfo, setSystemInfo] = useState<SystemInfo>({
        cpu_temp: 0,
        gpu_temp: 0,
        mb_temp: 0,
        cpu_fan_rpm: 0,
        gpu_fan_rpm: 0,
    });
    const { showToast } = useToast();
    const [errorShown, setErrorShown] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const info = await tauriApi.getSystemInfo();
            setSystemInfo(info);
            setErrorShown(false);
        } catch (error) {
            if (!errorShown) {
                showToast('Failed to load system info. Check if driver is loaded.', 'error');
                setErrorShown(true);
            }
            console.error('Failed to load system info:', error);
        }
    }, [errorShown, showToast]);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 2000);
        return () => clearInterval(interval);
    }, [loadData]);

    const getTempColor = (temp: number) => {
        if (temp >= 80) return 'text-red-600 dark:text-red-400';
        if (temp >= 70) return 'text-orange-600 dark:text-orange-400';
        if (temp >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    const getTempBgColor = (temp: number) => {
        if (temp >= 80) return 'bg-red-100 dark:bg-red-900/20';
        if (temp >= 70) return 'bg-orange-100 dark:bg-orange-900/20';
        if (temp >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
        return 'bg-green-100 dark:bg-green-900/20';
    };

    return (
        <div className='space-y-4'>
            <Card>
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <Thermometer className='h-5 w-5' />
                        <CardTitle>Temperatures</CardTitle>
                    </div>
                    <CardDescription>Real-time temperature monitoring</CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                    <div
                        className={`flex items-center justify-between rounded-lg border p-4 ${getTempBgColor(systemInfo.cpu_temp)}`}
                    >
                        <div className='flex items-center gap-3'>
                            <Activity className={`h-5 w-5 ${getTempColor(systemInfo.cpu_temp)}`} />
                            <div>
                                <div className='text-sm font-medium'>CPU Temperature</div>
                                <div className='text-xs text-muted-foreground'>
                                    Processor thermal sensor
                                </div>
                            </div>
                        </div>
                        <div className={`text-2xl font-bold ${getTempColor(systemInfo.cpu_temp)}`}>
                            {systemInfo.cpu_temp}°C
                        </div>
                    </div>

                    <div
                        className={`flex items-center justify-between rounded-lg border p-4 ${getTempBgColor(systemInfo.gpu_temp)}`}
                    >
                        <div className='flex items-center gap-3'>
                            <Gauge className={`h-5 w-5 ${getTempColor(systemInfo.gpu_temp)}`} />
                            <div>
                                <div className='text-sm font-medium'>GPU Temperature</div>
                                <div className='text-xs text-muted-foreground'>
                                    Graphics card thermal sensor
                                </div>
                            </div>
                        </div>
                        <div className={`text-2xl font-bold ${getTempColor(systemInfo.gpu_temp)}`}>
                            {systemInfo.gpu_temp}°C
                        </div>
                    </div>

                    <div
                        className={`flex items-center justify-between rounded-lg border p-4 ${getTempBgColor(systemInfo.mb_temp)}`}
                    >
                        <div className='flex items-center gap-3'>
                            <Thermometer
                                className={`h-5 w-5 ${getTempColor(systemInfo.mb_temp)}`}
                            />
                            <div>
                                <div className='text-sm font-medium'>Motherboard Temperature</div>
                                <div className='text-xs text-muted-foreground'>
                                    System board thermal sensor
                                </div>
                            </div>
                        </div>
                        <div className={`text-2xl font-bold ${getTempColor(systemInfo.mb_temp)}`}>
                            {systemInfo.mb_temp}°C
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <Fan className='h-5 w-5' />
                        <CardTitle>Fan Speeds</CardTitle>
                    </div>
                    <CardDescription>Current fan rotation speeds</CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                    <div className='flex items-center justify-between rounded-lg border bg-blue-100 p-4 dark:bg-blue-900/20'>
                        <div className='flex items-center gap-3'>
                            <Fan className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                            <div>
                                <div className='text-sm font-medium'>CPU Fan</div>
                                <div className='text-xs text-muted-foreground'>
                                    Primary cooling fan
                                </div>
                            </div>
                        </div>
                        <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                            {systemInfo.cpu_fan_rpm} RPM
                        </div>
                    </div>

                    <div className='flex items-center justify-between rounded-lg border bg-purple-100 p-4 dark:bg-purple-900/20'>
                        <div className='flex items-center gap-3'>
                            <Fan className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                            <div>
                                <div className='text-sm font-medium'>GPU Fan</div>
                                <div className='text-xs text-muted-foreground'>
                                    Graphics card cooling fan
                                </div>
                            </div>
                        </div>
                        <div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                            {systemInfo.gpu_fan_rpm} RPM
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Temperature Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-2 text-sm'>
                        <div className='flex items-center gap-2'>
                            <div className='h-3 w-3 rounded-full bg-green-500' />
                            <span>
                                <strong>&lt; 60°C:</strong> Normal operating temperature
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className='h-3 w-3 rounded-full bg-yellow-500' />
                            <span>
                                <strong>60-70°C:</strong> Moderate load, acceptable
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className='h-3 w-3 rounded-full bg-orange-500' />
                            <span>
                                <strong>70-80°C:</strong> High load, consider better cooling
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className='h-3 w-3 rounded-full bg-red-500' />
                            <span>
                                <strong>&gt; 80°C:</strong> Very high, thermal throttling may occur
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
