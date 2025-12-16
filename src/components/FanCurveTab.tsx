import { useCallback, useEffect, useState } from 'react';
import { Activity, Info, Loader2, Save } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { tauriApi } from '@/lib/tauri';
import { useToast } from '@/lib/toast-provider';
import type { FanCurvePoint } from '@/lib/types';

export function FanCurveTab() {
    const [curvePoints, setCurvePoints] = useState<FanCurvePoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [editTemp, setEditTemp] = useState('0');
    const [editSpeed, setEditSpeed] = useState('0');
    const { showToast } = useToast();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const points = await tauriApi.getAllFanCurvePoints();
            setCurvePoints(points);
        } catch (error) {
            showToast(`Failed to load fan curve: ${error}`, 'error');
            console.error('Failed to load fan curve:', error);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                loadData();
            });
        });
    }, [loadData]);

    const handleSavePoint = async () => {
        const temp = parseInt(editTemp);
        const speed = parseInt(editSpeed);

        if (isNaN(temp) || isNaN(speed)) {
            showToast('Please enter valid numbers', 'error');
            return;
        }

        if (temp < 0 || temp > 100) {
            showToast('Temperature must be between 0 and 100°C', 'error');
            return;
        }

        if (speed < 0 || speed > 255) {
            showToast('Speed must be between 0 and 255', 'error');
            return;
        }

        setLoading(true);
        try {
            await tauriApi.setFanCurvePoint(selectedIndex, temp, speed);
            await loadData();
            showToast(`Fan curve point ${selectedIndex} saved successfully`, 'success');
        } catch (error) {
            showToast(`Failed to save fan curve point: ${error}`, 'error');
            console.error('Failed to save fan curve point:', error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = curvePoints.map((point, index) => ({
        index,
        temperature: point.temperature,
        speed: Math.round((point.speed / 255) * 100),
    }));

    if (loading && curvePoints.length === 0) {
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
                        <Activity className='h-5 w-5' />
                        <CardTitle>Fan Curve</CardTitle>
                    </div>
                    <CardDescription>Customize fan speed response to temperature</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='h-64 w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <LineChart data={chartData}>
                                <XAxis
                                    dataKey='temperature'
                                    label={{
                                        value: 'Temperature (°C)',
                                        position: 'insideBottom',
                                        offset: -5,
                                    }}
                                />
                                <YAxis
                                    label={{
                                        value: 'Fan Speed (%)',
                                        angle: -90,
                                        position: 'insideLeft',
                                    }}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className='rounded-lg border bg-background p-2 shadow-md'>
                                                    <p className='text-sm'>
                                                        <strong>Temp:</strong>{' '}
                                                        {payload[0].payload.temperature}°C
                                                    </p>
                                                    <p className='text-sm'>
                                                        <strong>Speed:</strong>{' '}
                                                        {payload[0].payload.speed}%
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Line
                                    type='monotone'
                                    dataKey='speed'
                                    stroke='hsl(var(--primary))'
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Fan Curve Point</CardTitle>
                    <CardDescription>
                        Modify individual points on the fan curve (15 points available)
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='point-index'>Point Index (0-14)</Label>
                        <Input
                            id='point-index'
                            type='number'
                            min={0}
                            max={14}
                            value={selectedIndex}
                            onChange={e =>
                                setSelectedIndex(
                                    Math.max(0, Math.min(14, parseInt(e.target.value) || 0))
                                )
                            }
                        />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='temperature'>Temperature (°C)</Label>
                            <Input
                                id='temperature'
                                type='number'
                                min={0}
                                max={100}
                                value={editTemp}
                                onChange={e => setEditTemp(e.target.value)}
                                disabled={loading}
                            />
                            <p className='text-xs text-muted-foreground'>Range: 0-100°C</p>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='speed'>Fan Speed (0-255)</Label>
                            <Input
                                id='speed'
                                type='number'
                                min={0}
                                max={255}
                                value={editSpeed}
                                onChange={e => setEditSpeed(e.target.value)}
                                disabled={loading}
                            />
                            <p className='text-xs text-muted-foreground'>Range: 0-255</p>
                        </div>
                    </div>

                    <Button onClick={handleSavePoint} disabled={loading} className='w-full'>
                        <Save className='mr-2 h-4 w-4' />
                        Save Point
                    </Button>

                    <div className='rounded-lg border bg-muted/50 p-3 text-sm'>
                        <div className='flex items-start gap-2'>
                            <Info className='h-4 w-4 mt-0.5 shrink-0 text-muted-foreground' />
                            <p className='text-muted-foreground'>
                                Points should be in non-decreasing order for both temperature and
                                speed. Enable Custom fan mode for the curve to take effect.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
