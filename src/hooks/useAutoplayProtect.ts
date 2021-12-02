import { useEffect, useRef } from "react";

export default function useAutoplayProtect<T>(generator: () => T) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const fn = () => {
      if (ref.current === null) {
        ref.current = generator();
      }
      document.body.removeEventListener('mousedown', fn);
      document.body.removeEventListener('touchstart', fn);
    };

    document.body.addEventListener('mousedown', fn);
    document.body.addEventListener('touchstart', fn);

    return () => {
      document.body.removeEventListener('mousedown', fn);
      document.body.removeEventListener('touchstart', fn);
    };
  }, []);

  return ref.current;
}