import { useCallback, useEffect, useState } from 'react';
import { Fan, Loader2, Wind } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { tauriApi } from '@/lib/tauri';
import { useToast } from '@/lib/toast-provider';
import { FanMode, FanModeLabels } from '@/lib/types';

export function FanControlTab() {
    const [fanMode, setFanMode] = useState<FanMode>(FanMode.Normal);
    const [customSpeed, setCustomSpeed] = useState(50);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const loadData = useCallback(async () => {
        try {
            const [mode, speed] = await Promise.all([
                tauriApi.getFanMode(),
                tauriApi.getFanCustomSpeed(),
            ]);
            setFanMode(mode);
            setCustomSpeed(speed);
            setError(null);
        } catch (err) {
            const errorMsg = String(err);
            setError(errorMsg);
            showToast(`Failed to load fan data: ${errorMsg}`, 'error');
            console.error('Failed to load fan data:', err);
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

    const handleFanModeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const mode = Number(e.target.value) as FanMode;
        setLoading(true);
        try {
            await tauriApi.setFanMode(mode);
            setFanMode(mode);
            showToast(`Fan mode set to ${FanModeLabels[mode]}`, 'success');
        } catch (error) {
            showToast(`Failed to set fan mode: ${error}`, 'error');
            console.error('Failed to set fan mode:', error);
            await loadData();
        } finally {
            setLoading(false);
        }
    };

    const handleCustomSpeedChange = async (value: number[]) => {
        const speed = value[0];
        const roundedSpeed = Math.round(speed / 5) * 5;
        setCustomSpeed(roundedSpeed);
    };

    const applyCustomSpeed = async () => {
        setLoading(true);
        try {
            await tauriApi.setFanCustomSpeed(customSpeed);
            showToast(`Custom fan speed set to ${customSpeed}%`, 'success');
        } catch (error) {
            showToast(`Failed to set custom speed: ${error}`, 'error');
            console.error('Failed to set custom speed:', error);
        } finally {
            setLoading(false);
        }
    };

    const isCustomMode =
        fanMode === FanMode.Custom || fanMode === FanMode.Auto || fanMode === FanMode.Fixed;

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
                        Error Loading Fan Control
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
                        <Fan className='h-5 w-5' />
                        <CardTitle>Fan Mode</CardTitle>
                    </div>
                    <CardDescription>
                        Control your laptop&apos;s cooling system behavior
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='fan-mode'>Mode</Label>
                        <Select
                            id='fan-mode'
                            value={fanMode.toString()}
                            onChange={handleFanModeChange}
                            disabled={loading}
                        >
                            {Object.entries(FanModeLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className='rounded-lg border p-4'>
                        <div className='mb-2 text-sm font-medium'>
                            Current Mode: {FanModeLabels[fanMode]}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                            {fanMode === FanMode.Normal && 'Balanced cooling and noise levels'}
                            {fanMode === FanMode.Silent && 'Minimal fan noise, reduced cooling'}
                            {fanMode === FanMode.Gaming && 'Maximum cooling performance'}
                            {fanMode === FanMode.Custom && 'Use custom fan curve settings'}
                            {fanMode === FanMode.Auto &&
                                'Automatic speed adjustment based on temperature'}
                            {fanMode === FanMode.Fixed && 'Fixed fan speed setting'}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className='flex items-center gap-2'>
                        <Wind className='h-5 w-5' />
                        <CardTitle>Custom Fan Speed</CardTitle>
                    </div>
                    <CardDescription>
                        {isCustomMode
                            ? 'Adjust fan speed manually (25-100%, steps of 5%)'
                            : 'Enable Custom, Auto, or Fixed mode to adjust fan speed'}
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                            <Label>Speed: {customSpeed}%</Label>
                        </div>
                        <Slider
                            value={[customSpeed]}
                            onValueChange={handleCustomSpeedChange}
                            min={25}
                            max={100}
                            step={5}
                            disabled={!isCustomMode || loading}
                        />
                        <div className='flex justify-between text-xs text-muted-foreground'>
                            <span>25%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <Button
                        onClick={applyCustomSpeed}
                        disabled={!isCustomMode || loading}
                        className='w-full'
                    >
                        Apply Speed
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
