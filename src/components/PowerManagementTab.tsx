import { useCallback, useEffect, useState } from 'react';
import { Battery, BatteryCharging, Info, Loader2, Power } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { tauriApi } from '@/lib/tauri';
import { useToast } from '@/lib/toast-provider';
import { ChargeMode } from '@/lib/types';

export function PowerManagementTab() {
    const [chargeMode, setChargeMode] = useState<ChargeMode>(ChargeMode.Normal);
    const [chargeLimit, setChargeLimit] = useState(100);
    const [batteryCycle, setBatteryCycle] = useState(0);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const loadData = useCallback(async () => {
        try {
            const [mode, limit, cycle] = await Promise.all([
                tauriApi.getChargeMode(),
                tauriApi.getChargeLimit(),
                tauriApi.getBatteryCycle(),
            ]);
            setChargeMode(mode);
            setChargeLimit(limit);
            setBatteryCycle(cycle);
            setError(null);
        } catch (err) {
            const errorMsg = String(err);
            setError(errorMsg);
            showToast(`Failed to load power data: ${errorMsg}`, 'error');
            console.error('Failed to load power data:', err);
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

    const handleChargeModeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const mode = Number(e.target.value) as ChargeMode;
        setLoading(true);
        try {
            await tauriApi.setChargeMode(mode);
            setChargeMode(mode);
            showToast(
                `Charge mode set to ${mode === ChargeMode.Normal ? 'Normal' : 'Custom'}`,
                'success'
            );
        } catch (error) {
            showToast(`Failed to set charge mode: ${error}`, 'error');
            console.error('Failed to set charge mode:', error);
            await loadData();
        } finally {
            setLoading(false);
        }
    };

    const handleChargeLimitChange = async (value: number[]) => {
        const limit = value[0];
        setChargeLimit(limit);
        if (chargeMode === ChargeMode.Custom) {
            setLoading(true);
            try {
                await tauriApi.setChargeLimit(limit);
                showToast(`Charge limit set to ${limit}%`, 'success');
            } catch (error) {
                showToast(`Failed to set charge limit: ${error}`, 'error');
                console.error('Failed to set charge limit:', error);
            } finally {
                setLoading(false);
            }
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

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='text-red-600 dark:text-red-400'>
                        Error Loading Power Management
                    </CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className='space-y-4'>
            <Card>
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <BatteryCharging className='h-5 w-5' />
                        <CardTitle>Charging Mode</CardTitle>
                    </div>
                    <CardDescription>Configure battery charging behavior</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='charge-mode'>Mode</Label>
                        <Select
                            id='charge-mode'
                            value={chargeMode.toString()}
                            onChange={handleChargeModeChange}
                            disabled={loading}
                        >
                            <option value={ChargeMode.Normal}>Normal (Charge to 100%)</option>
                            <option value={ChargeMode.Custom}>Custom (Use Charge Limit)</option>
                        </Select>
                    </div>

                    <div className='rounded-lg border p-4'>
                        <div className='mb-2 text-sm font-medium'>
                            {chargeMode === ChargeMode.Normal ? 'Normal Mode' : 'Custom Mode'}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                            {chargeMode === ChargeMode.Normal
                                ? 'Battery will charge to 100% capacity'
                                : 'Battery will stop charging at the set limit to preserve battery health'}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <Power className='h-5 w-5' />
                        <CardTitle>Charge Limit</CardTitle>
                    </div>
                    <CardDescription>
                        {chargeMode === ChargeMode.Custom
                            ? 'Set maximum charge level (60-100%)'
                            : 'Enable Custom mode to adjust charge limit'}
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                            <Label>Limit: {chargeLimit}%</Label>
                        </div>
                        <Slider
                            value={[chargeLimit]}
                            onValueChange={handleChargeLimitChange}
                            min={60}
                            max={100}
                            step={1}
                            disabled={chargeMode !== ChargeMode.Custom || loading}
                        />
                        <div className='flex justify-between text-xs text-muted-foreground'>
                            <span>60%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <div className='rounded-lg border bg-muted/50 p-3 text-sm'>
                        <div className='flex items-start gap-2'>
                            <Info className='h-4 w-4 mt-0.5 shrink-0 text-muted-foreground' />
                            <p className='text-muted-foreground'>
                                Keeping charge limit at 80% can help extend battery lifespan
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <Battery className='h-5 w-5' />
                        <CardTitle>Battery Information</CardTitle>
                    </div>
                    <CardDescription>Current battery health metrics</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='flex items-center justify-between rounded-lg border p-4'>
                        <div>
                            <div className='text-sm font-medium'>Charge Cycles</div>
                            <div className='text-xs text-muted-foreground'>
                                Number of full charge cycles
                            </div>
                        </div>
                        <div className='text-2xl font-bold'>{batteryCycle}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
