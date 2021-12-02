import { useState, useEffect, useCallback } from 'react';

const noclick = Object.freeze({ clicks: 0 });

export default function useSingleAndDoubleClick(
  actionSimpleClick: (e: React.MouseEvent) => any,
  actionDoubleClick: (e: React.MouseEvent) => any,
  delay = 250
) {
    const [click, setClick] = useState<{ e?: React.MouseEvent, clicks: number }>(noclick);

    useEffect(() => {
        const timer = setTimeout(() => {
            // simple click
            setClick(noclick);
        }, delay);
        // the duration between this click and the previous one
        // is less than the value of delay = double-click
        if (click.clicks === 1) actionSimpleClick(click.e!);
        if (click.clicks === 2) actionDoubleClick(click.e!);

        return () => clearTimeout(timer);
    }, [click]);

    const cb = useCallback((e: React.MouseEvent) => {
        setClick(prev => ({ e, clicks: prev.clicks + 1 }))
    }, []);

    return cb;
}