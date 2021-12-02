import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getGlobalState, useGlobalState } from "../state/GlobalState";
import { Track } from "../lib/types";

export default function useCurrentTrackAsync()
{
  const currentTrackId = useGlobalState(state => state.currentTrackId);
  const tracks = useGlobalState(state => state.tracks);

  return useMemo(() => currentTrackId ? tracks[currentTrackId] : null, [currentTrackId, currentTrackId !== null && tracks[currentTrackId]]);
}