import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getGlobalState, useGlobalState } from "../state/GlobalState";
import { Track } from "../lib/types";

export default function useCurrentTrackSync()
{
  return useCallback(() => {
    const state = getGlobalState();
    return state.currentTrackId === null ? null : state.tracks[state.currentTrackId];
  }, []);
}