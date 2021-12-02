import { useEffect, useRef } from "react";

let idCounter = 0;

type EventSchema = {
  'seekTime': (ms: number) => void,
  'previousOrRestart': () => void,
  'next': () => void,
  'play': () => void,
};  

const listeners: {[p in keyof EventSchema]: EventSchema[p][]} = {
  seekTime: [],
  previousOrRestart: [],
  next: [],
  play: [],
};

(window as any).globalListeners = listeners;

export function emitGlobalEvent<K extends keyof EventSchema>(event: K, ...args: Parameters<EventSchema[K]>) {
  listeners[event].forEach((listener) => {
    (listener as any)(...args);
  });
}

export function useGlobalEventListener<K extends keyof EventSchema>(event: K, callback: EventSchema[K]) {
  useEffect(() => {
    listeners[event].push(callback as any);

    return () => {
      listeners[event].splice(listeners[event].indexOf(callback as any), 1);
    };
  }, [event, callback]);
}