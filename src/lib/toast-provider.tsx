import React, { createContext, useContext, useState } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastContextType {
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className='fixed bottom-4 right-4 z-50 flex flex-col gap-2'>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
                            toast.type === 'error'
                                ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100'
                                : toast.type === 'success'
                                  ? 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100'
                                  : 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100'
                        }`}
                    >
                        {toast.type === 'error' && <AlertCircle className='h-5 w-5' />}
                        {toast.type === 'success' && <CheckCircle className='h-5 w-5' />}
                        <span className='flex-1 text-sm font-medium'>{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className='hover:opacity-70'>
                            <X className='h-4 w-4' />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
