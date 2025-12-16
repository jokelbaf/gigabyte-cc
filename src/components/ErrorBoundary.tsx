import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className='flex min-h-screen items-center justify-center p-6'>
                    <Card className='w-full max-w-md'>
                        <CardHeader>
                            <CardTitle className='text-red-600'>Something went wrong</CardTitle>
                            <CardDescription>
                                An error occurred while loading the application
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='rounded-lg bg-red-50 p-4 dark:bg-red-900/20'>
                                <p className='text-sm text-red-800 dark:text-red-200'>
                                    {this.state.error?.message || 'Unknown error'}
                                </p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className='mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
                            >
                                Reload Application
                            </button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
