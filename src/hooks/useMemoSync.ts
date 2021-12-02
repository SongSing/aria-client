import equal from "fast-deep-equal";
import { useRef } from "react";

export default function useMemoSync<T, U extends readonly any[]>(generator: (...args: U) => T, depGenerator: () => U): () => T {
  const depRef = useRef<U>(depGenerator());
  const valueRef = useRef<T>(generator(...depRef.current));

  const get = () => {
    const newDeps = depGenerator();
    if (!equal(depRef.current, newDeps)) {
      depRef.current = newDeps;
      valueRef.current = generator(...depRef.current);
    }

    return valueRef.current;
  };

  return get;
}