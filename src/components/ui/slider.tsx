import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'defaultValue'
> {
    onValueChange?: (value: number[]) => void;
    value?: number[];
    defaultValue?: number[];
    min?: number;
    max?: number;
    step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    (
        { className, onValueChange, value, defaultValue, min = 0, max = 100, step = 1, ...props },
        ref
    ) => {
        const [internalValue, setInternalValue] = React.useState<number>(
            value?.[0] ?? defaultValue?.[0] ?? min
        );

        const currentValue = value?.[0] ?? internalValue;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = Number(e.target.value);
            setInternalValue(newValue);
            if (onValueChange) {
                onValueChange([newValue]);
            }
        };

        return (
            <input
                type='range'
                ref={ref}
                min={min}
                max={max}
                step={step}
                value={currentValue}
                onChange={handleChange}
                className={cn(
                    'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary',
                    className
                )}
                {...props}
            />
        );
    }
);
Slider.displayName = 'Slider';

export { Slider };
