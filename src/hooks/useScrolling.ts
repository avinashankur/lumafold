import { useEffect, useState } from 'react';

export function useScrolling(delay = 1000) {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      setIsScrolling(true);

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsScrolling(false);
      }, delay);
    };

    window.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      clearTimeout(timeout);
    };
  }, [delay]);

  return isScrolling;
}
