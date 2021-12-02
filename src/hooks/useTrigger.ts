import { useCallback, useState } from "react";

export default function useTrigger() {
  const [state, setState] = useState(false);

  const trigger = useCallback(() => {
    setState(state => !state);
  }, []);

  return {
    listen: state,
    trigger
  };
}