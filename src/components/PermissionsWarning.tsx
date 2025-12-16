import { useEffect, useState } from 'react';
import { AlertTriangle, Terminal } from 'lucide-react';

import { tauriApi } from '@/lib/tauri';

export function PermissionsWarning() {
    const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);

    useEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        try {
            await tauriApi.getFanMode();
            setHasPermissions(true);
        } catch {
            setHasPermissions(false);
        }
    };

    if (hasPermissions === null) {
        return null;
    }

    if (hasPermissions) {
        return null;
    }

    return (
        <div className='mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950'>
            <div className='flex items-start gap-3'>
                <AlertTriangle className='h-5 w-5 shrink-0 text-red-600 dark:text-red-400' />
                <div className='flex-1'>
                    <h3 className='font-semibold text-red-900 dark:text-red-100'>
                        Permission Denied
                    </h3>
                    <p className='mt-1 text-sm text-red-800 dark:text-red-200'>
                        Cannot access the AORUS laptop driver. You need write permissions to
                        /sys/devices/platform/aorus_laptop
                    </p>
                    <div className='mt-3 space-y-2'>
                        <div className='flex items-start gap-2'>
                            <Terminal className='h-4 w-4 mt-0.5 shrink-0 text-red-700 dark:text-red-300' />
                            <div className='flex-1'>
                                <p className='text-sm font-medium text-red-900 dark:text-red-100'>
                                    Quick fix (temporary):
                                </p>
                                <code className='mt-1 block rounded bg-red-100 px-2 py-1 text-xs text-red-900 dark:bg-red-900 dark:text-red-100'>
                                    sudo chmod -R 666 /sys/devices/platform/aorus_laptop/*
                                </code>
                            </div>
                        </div>
                        <div className='flex items-start gap-2'>
                            <Terminal className='h-4 w-4 mt-0.5 shrink-0 text-red-700 dark:text-red-300' />
                            <div className='flex-1'>
                                <p className='text-sm font-medium text-red-900 dark:text-red-100'>
                                    Permanent fix (udev rule):
                                </p>
                                <code className='mt-1 block rounded bg-red-100 px-2 py-1 text-xs text-red-900 dark:bg-red-900 dark:text-red-100'>
                                    See README for installation instructions
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
