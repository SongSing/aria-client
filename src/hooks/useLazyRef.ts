import { useRef } from "react";

export default function useLazy<T>(generator: () => T) {
  const ref = useRef<T | null>(null);

  function get() {
    if (ref.current === null) {
      ref.current = generator();
    }

    return ref.current;
  }

  return get;
}