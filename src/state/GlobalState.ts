import React, { FunctionComponent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import useLazy from "../hooks/useLazyRef";
import { Playlist, Track } from "../lib/types";
import { array_shuffle, mod, sliceObject } from "../lib/utils";
import equal from 'fast-deep-equal';
// import App from "./App";
// import { Track, TrackMetadata } from "./Utils/types";

export type SetFn<T> = (current: T) => Partial<T>;

export function setArrayElement<T>(array: T[], index: number, value: T): T[]
{
  return array.map((e, i) => i === index ? value : e);
}

export function removeArrayElement<T>(array: T[], index: number): T[]
{
  return array.filter((e, i) => i !== index);
}

const pages = ["home", "tracks", "playlists", "albums", "stats", "settings"] as const;
export type Page = typeof pages[number];

export interface AppState {
  currentPage: Page,
  tracks: Record<string, Track>,
  currentTrackId: string | null,
  isPlaying: boolean,
  volume: number,
  currentTime: number,
  isShuffling: boolean,
  playOrder: number[],
  queue: string[],
  playlists: Playlist[]
};

const initialState: AppState = Object.freeze({
  currentPage: 'home',
  tracks: {},
  currentTrackId: null,
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  isShuffling: false,
  playOrder: [],
  queue: [],
  playlists: []
});

const globalState: AppState = {
  ...initialState
};

(window as any).globalState = globalState;

export function getGlobalState() {
  return Object.freeze({ ...globalState });
}

const defaultComparitor: Comparator<any> = equal;

type Selector<T extends any = any> = (state: AppState) => T;
type Comparator<T> = (old: T, current: T) => boolean;
type CallbackPayload<T = any> = {
  callback: (selected: T, state: AppState, oldState: AppState) => any,
  selector: Selector<T>,
  comparator: Comparator<T>
};

const callbacks: Map<any, CallbackPayload> = new Map();

(window as any).callbacks = callbacks;

export function useSubscription<T>(selector: Selector<T>, callback: CallbackPayload['callback'], comparator: Comparator<T> = defaultComparitor) {
  const myId = useLazy(() => Symbol('subscriptionId'));

  useEffect(() => {
    callbacks.set(myId(), { callback, selector, comparator });

    return () => {
      callbacks.delete(myId());
    };
  }, []);
}

export function useGlobalState<T>(selector: Selector<T>, comparator?: Comparator<T>) {
  const [state, setState] = useState(selector(globalState));

  useSubscription(selector, useCallback((s) => {
    // console.log(s);
    setState(s);
  }, []), comparator);

  return state;
}

export function useGlobalStateSlice<T extends (keyof AppState)[]>(...keys: T) {
  type U = Pick<AppState, typeof keys[number]>;

  const selector: Selector<U> = useCallback((state) => {
    let ret: Partial<AppState> = {};
    keys.forEach(key => (ret as any)[key] = state[key]);
    return ret as U;
  }, []);

  const comparator = useCallback((old, current) => {
    const oldEntries = Object.entries(old);
    const currentEntries = Object.entries(current);
    // console.log(oldEntries, currentEntries);
    return oldEntries.length === currentEntries.length && oldEntries.every(([key, value]) => (current as any)[key] === value);
  }, []);

  const state = useGlobalState(selector, comparator);
  return {
    asyncState: state,
    syncState: () => sliceObject(globalState, keys)
  };
}

export function setState(...args: (Partial<AppState> | SetFn<AppState>)[]) {
  const oldState = {...globalState};

  args.forEach((arg) => {
    if (typeof(arg) === 'function') {
      Object.assign(globalState, arg(globalState));
    } else {
      Object.assign(globalState, arg);
    }
  });

  callbacks.forEach(({ callback, selector, comparator }) => {
    let o = selector(oldState);
    let n = selector(globalState);
    // console.log(o, n, callback);
    if (!comparator(o, n)) {
      callback(n, globalState, oldState);
    }
  });
}

export const toggleShuffle: SetFn<AppState> = (state) => {
  let newIsShuffling = !state.isShuffling;
  let playOrder = Array(state.queue.length).fill(0).map((_, i) => i);
  if (newIsShuffling)
  {
    array_shuffle(playOrder);
  }

  return {
    ...state,
    isShuffling: newIsShuffling,
    playOrder
  };
};

export const gotoPreviousTrack: SetFn<AppState> = (state) => {
  if (state.currentTrackId === null) {
    return state;
  }
  else {
    let index = state.queue.indexOf(state.currentTrackId);
    let poIndex = state.playOrder.indexOf(index);
    let newIndex = state.playOrder[mod((poIndex - 1), state.playOrder.length)];
    let newSongId = state.queue[newIndex];

    return {
      currentTrackId: newSongId
    };
  }
};

export const gotoNextTrack: SetFn<AppState> = (state) => {
  if (state.currentTrackId === null) {
    return state;
  }
  else {
    let index = state.queue.indexOf(state.currentTrackId);
    let poIndex = state.playOrder.indexOf(index);
    let newIndex = state.playOrder[((poIndex + 1) % state.playOrder.length)];
    let newSongId = state.queue[newIndex] ?? null;

    return {
      currentTrackId: newSongId
    };
  }
};

export const setQueue = (queue: string[]): SetFn<AppState> => {
  return (state) => {
    let playOrder = Array(queue.length).fill(0).map((_, i) => i);
    if (state.isShuffling)
    {
      array_shuffle(playOrder);
    }
  
    return {
      queue,
      playOrder
    };
  }
};

export const setTrack = (id: string, track: Partial<Track>): SetFn<AppState> => {
  return (state) => {
    return {
      tracks: {
        ...state.tracks,
        [id]: {
          ...state.tracks[id],
          ...track
        }
      }
    };
  };
};

export const upsertPlaylist = (playlist: Playlist): SetFn<AppState> => {
  return (state) => {
    return {
      ...state,
      playlists: state.playlists.some(p => p.id === playlist.id) ?
        state.playlists.map(p => p.id === playlist.id ? { ...p, ...playlist } : p) :
        state.playlists.concat([playlist])
    }
  };
};

export const removePlaylist = (playlist: Playlist): SetFn<AppState> => {
  return (state) => {
    return {
      ...state,
      playlists: state.playlists.filter(p => p.id !== playlist.id)
    }
  };
};