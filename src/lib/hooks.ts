import React, { useCallback, useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef<(() => void) | undefined>(undefined);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) {
            return;
        }

        const tick = () => {
            if (savedCallback.current) {
                savedCallback.current();
            }
        };

        const id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay]);
}

export function useAsyncData<T>(
    fetcher: () => Promise<T>,
    deps: React.DependencyList = [],
    interval?: number
) {
    const [data, setData] = React.useState<T | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    const loadData = useCallback(async () => {
        try {
            const result = await fetcher();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetcher, ...deps]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useInterval(loadData, interval ?? null);

    return { data, error, loading, reload: loadData };
}
