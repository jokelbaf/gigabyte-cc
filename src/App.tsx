import { Activity, Battery, Fan, Gauge, LineChart, Moon, Sun } from 'lucide-react';

import { FanControlTab } from '@/components/FanControlTab';
import { FanCurveTab } from '@/components/FanCurveTab';
import { PerformanceTab } from '@/components/PerformanceTab';
import { PermissionsWarning } from '@/components/PermissionsWarning';
import { PowerManagementTab } from '@/components/PowerManagementTab';
import { SystemInfoTab } from '@/components/SystemInfoTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/lib/theme-provider';

import './App.css';

function App() {
    const { theme, setTheme } = useTheme();

    return (
        <main className='flex min-h-screen w-full flex-col bg-background p-6'>
            <div className='mb-6 flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold'>AORUS Control Center</h1>
                    <p className='text-muted-foreground'>
                        Manage your laptop&apos;s performance and power settings
                    </p>
                </div>
                <Button
                    variant='outline'
                    size='icon'
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    title='Toggle theme'
                >
                    {theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
                </Button>
            </div>

            <PermissionsWarning />

            <Tabs defaultValue='fan' className='w-full'>
                <TabsList className='grid w-full grid-cols-5'>
                    <TabsTrigger value='fan' className='flex items-center gap-2'>
                        <Fan className='h-4 w-4' />
                        <span className='hidden sm:inline'>Fan Control</span>
                    </TabsTrigger>
                    <TabsTrigger value='power' className='flex items-center gap-2'>
                        <Battery className='h-4 w-4' />
                        <span className='hidden sm:inline'>Power</span>
                    </TabsTrigger>
                    <TabsTrigger value='performance' className='flex items-center gap-2'>
                        <Gauge className='h-4 w-4' />
                        <span className='hidden sm:inline'>Performance</span>
                    </TabsTrigger>
                    <TabsTrigger value='curve' className='flex items-center gap-2'>
                        <LineChart className='h-4 w-4' />
                        <span className='hidden sm:inline'>Fan Curve</span>
                    </TabsTrigger>
                    <TabsTrigger value='system' className='flex items-center gap-2'>
                        <Activity className='h-4 w-4' />
                        <span className='hidden sm:inline'>System Info</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='fan' className='mt-6'>
                    <FanControlTab />
                </TabsContent>

                <TabsContent value='power' className='mt-6'>
                    <PowerManagementTab />
                </TabsContent>

                <TabsContent value='performance' className='mt-6'>
                    <PerformanceTab />
                </TabsContent>

                <TabsContent value='curve' className='mt-6'>
                    <FanCurveTab />
                </TabsContent>

                <TabsContent value='system' className='mt-6'>
                    <SystemInfoTab />
                </TabsContent>
            </Tabs>
        </main>
    );
}

export default App;
