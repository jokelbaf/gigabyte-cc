import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Cpu, Info, Loader2, Zap } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { tauriApi } from '@/lib/tauri';
import { useToast } from '@/lib/toast-provider';

export function PerformanceTab() {
    const [gpuBoost, setGpuBoost] = useState(0);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [usbS3, setUsbS3] = useState(0);
    const [usbS4, setUsbS4] = useState(0);
    const { showToast } = useToast();

    const loadData = useCallback(async () => {
        try {
            const [boost, s3, s4] = await Promise.all([
                tauriApi.getGpuBoost(),
                tauriApi.getUsbChargeS3(),
                tauriApi.getUsbChargeS4(),
            ]);
            setGpuBoost(boost);
            setUsbS3(s3);
            setUsbS4(s4);
        } catch (error) {
            showToast(`Failed to load performance data: ${error}`, 'error');
            console.error('Failed to load performance data:', error);
        } finally {
            setInitialLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                loadData();
            });
        });
    }, [loadData]);

    const handleGpuBoostChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const mode = Number(e.target.value);
        setLoading(true);
        try {
            await tauriApi.setGpuBoost(mode);
            setGpuBoost(mode);
            showToast(`GPU boost mode set to ${mode}`, 'success');
        } catch (error) {
            showToast(`Failed to set GPU boost: ${error}`, 'error');
            console.error('Failed to set GPU boost:', error);
            await loadData();
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <Card>
                <CardContent className='flex items-center justify-center py-12'>
                    <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className='space-y-4'>
            <Card>
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <Zap className='h-5 w-5' />
                        <CardTitle>GPU Boost</CardTitle>
                    </div>
                    <CardDescription>Control discrete GPU power limit boost</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='gpu-boost'>Boost Mode</Label>
                        <Select
                            id='gpu-boost'
                            value={gpuBoost.toString()}
                            onChange={handleGpuBoostChange}
                            disabled={loading}
                        >
                            <option value='0'>Disabled</option>
                            <option value='1'>Enabled</option>
                            <option value='2'>Mode 2</option>
                            <option value='3'>Mode 3</option>
                        </Select>
                    </div>

                    <div className='rounded-lg border p-4'>
                        <div className='mb-2 text-sm font-medium'>
                            Status: {gpuBoost === 0 ? 'Disabled' : `Mode ${gpuBoost}`}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                            {gpuBoost === 0
                                ? 'GPU is running at default power limit'
                                : 'GPU power limit is boosted for better performance'}
                        </div>
                    </div>

                    <div className='rounded-lg border bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400'>
                        <div className='flex items-start gap-2'>
                            <AlertTriangle className='h-4 w-4 mt-0.5 shrink-0' />
                            <p>Higher boost modes may increase heat and power consumption</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <Cpu className='h-5 w-5' />
                        <CardTitle>USB Power Settings</CardTitle>
                    </div>
                    <CardDescription>
                        USB charging when laptop is in sleep/hibernate mode
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='space-y-3'>
                        <div className='flex items-center justify-between rounded-lg border p-4'>
                            <div>
                                <div className='text-sm font-medium'>USB Charge in Sleep (S3)</div>
                                <div className='text-xs text-muted-foreground'>
                                    Allow USB charging when laptop is sleeping
                                </div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        usbS3 === 1
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                                >
                                    {usbS3 === 1 ? 'Enabled' : 'Disabled'}
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center justify-between rounded-lg border p-4'>
                            <div>
                                <div className='text-sm font-medium'>
                                    USB Charge in Hibernate (S4)
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                    Allow USB charging when laptop is hibernating
                                </div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        usbS4 === 1
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                                >
                                    {usbS4 === 1 ? 'Enabled' : 'Disabled'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='rounded-lg border bg-muted/50 p-3 text-sm'>
                        <div className='flex items-start gap-2'>
                            <Info className='h-4 w-4 mt-0.5 shrink-0 text-muted-foreground' />
                            <p className='text-muted-foreground'>
                                These settings are read-only and configured in firmware
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
