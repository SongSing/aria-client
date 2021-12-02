import { useCallback, useEffect, useRef } from "react";
import useApi from "../hooks/useApi";
import useApiExtensions from "../hooks/useApiExtensions";
import useAutoplayProtect from "../hooks/useAutoplayProtect";
import useCurrentTrackSync from "../hooks/useCurrentTrackSync";
import useLazy from "../hooks/useLazyRef";
import useTrackArt from "../hooks/useTrackArt";
import { useGlobalEventListener } from "../lib/GlobalEvents";
import { getGlobalState, gotoNextTrack, gotoPreviousTrack, setState, useGlobalStateSlice, useSubscription } from "../state/GlobalState";
import localforage from 'localforage';
import TrackCache from "../lib/TrackCache";
import useCurrentTrackAsync from "../hooks/useCurrentTrackAsync";
import { ListenEntry, TrackSettings } from "../lib/types";
import useEnsuredApi from "../hooks/useEnsuredApi";
import useTrigger from "../hooks/useTrigger";

export default function Player() {
  const api = useApi();
  const apiExtensions = useApiExtensions(api);
  const ensuredApi = useEnsuredApi();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const currentTrack = useCurrentTrackSync();
  const currentTrackAsync = useCurrentTrackAsync();
  const previousBoundary = currentTrackAsync ? Math.min(3, currentTrackAsync.metadata.length / 2) : 0;
  const artSrc = useTrackArt(currentTrackAsync);
  
  const startedListeningAt = useRef<null | number>(0);
  const startedListeningTrackId = useRef<null | string>(null);

  const previousOrRestartTrigger = useTrigger();
  const nextTrigger = useTrigger();
  
  const { asyncState, syncState } = useGlobalStateSlice('isPlaying', 'currentTrackId', 'volume', 'tracks');

  //#region Init

  //#endregion

  //#region Helpers

  useEffect(() => {
    updateMetadata();
  }, [artSrc, currentTrackAsync]);

  useEffect(() => {
    performPreviousOrRestart();
  }, [previousOrRestartTrigger.listen]);

  useEffect(() => {
    performNext();
  }, [nextTrigger.listen]);

  function updateMetadata() {
    (document.querySelector("link[rel*='icon']") as any).href = artSrc;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrackAsync?.metadata.title,
        artist: currentTrackAsync?.metadata.artist,
        album: currentTrackAsync?.metadata.album,
        artwork: [
          { src: artSrc, sizes: 'any' },
        ]
      });
    }

    document.title = currentTrackAsync ? `${currentTrackAsync.metadata.artist} - ${currentTrackAsync.metadata.title} // Aria` : 'Aria';
  }

  function recordChunk(allowance: number) {
    if (!startedListeningAt.current) return;

    if (Date.now() - startedListeningAt.current! < allowance) return;

    const payload = {
        trackId: syncState().currentTrackId!,
        started: startedListeningAt.current!,
        ended: Date.now()
    } as ListenEntry & { trackId: string };

    ensuredApi.post('/tracks/listenEntries', payload);
  }

  function ensureAudioContext() {
    if (!audioRef.current) return;

    if (audioContext.current === null) {
      const state = syncState();
      audioContext.current = new AudioContext();
      gainNode.current = audioContext.current.createGain();
      gainNode.current.gain.value = state.currentTrackId ? state.tracks[state.currentTrackId].settings.volume : 1;
      const track = audioContext.current.createMediaElementSource(audioRef.current);
      track.connect(gainNode.current).connect(audioContext.current.destination);
    }
  }

  const performPreviousOrRestart = useCallback(() => {
    if (!currentTrackAsync || !audioRef.current) return;

    // should we restart the song or go back?
    if (audioRef.current.currentTime >= previousBoundary) {
      audioRef.current.currentTime = 0; // will propogate to state via timechanged event
    }
    else {
      recordChunk(3000);
      startedListeningAt.current = null;
      setState(gotoPreviousTrack);
    }
  }, [currentTrackAsync]);

  const performNext = useCallback(() => {
    if (!currentTrackAsync || !audioRef.current) return;

    recordChunk(3000);
    startedListeningAt.current = null;
    setState(gotoNextTrack);
  }, [currentTrackAsync]);

  const seekTime = useCallback((ms: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = ms;
    }
  }, [])

  async function cacheTrack() {
    const track = currentTrack();
    if (track) {
      try {
        if (!await TrackCache.isTrackCached(track.id)) {
          const blob = await apiExtensions.getTrack(track);
          TrackCache.cacheTrack(track.id, blob);
        }
      } catch(e) {
        console.error(e);
      }
    }
  }

  useEffect(() => {
    console.log(navigator);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('previoustrack', performPreviousOrRestart);
      navigator.mediaSession.setActionHandler('nexttrack', performNext);
      navigator.mediaSession.setActionHandler('play', () => {
        setState({ isPlaying: true })
      });
      navigator.mediaSession.setActionHandler('pause', () => setState({ isPlaying: false }));
    }

    return () => {
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
    };
  }, [performPreviousOrRestart, performNext, setState]);

  //#endregion

  //#region DOM Event Handlers

  const handleTrackEnd = useCallback(() => {
    if (startedListeningAt.current !== null && startedListeningTrackId.current === asyncState.currentTrackId) {
      recordChunk(0);
      startedListeningAt.current = null;
    }

    setState(gotoNextTrack);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    setState({ currentTime: audioRef.current?.currentTime ?? 0 });
  }, []);

  const playIfNeeded = useCallback(() => {
    if (syncState().isPlaying && audioRef.current) {
      ensureAudioContext();
      audioRef.current.play();
    }
  }, []);

  const handlePlay = useCallback(() => {
    startedListeningAt.current = Date.now();

    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  }, []);

  const handlePause = useCallback(() => {
    if (startedListeningAt.current && startedListeningTrackId.current === asyncState.currentTrackId) {
      recordChunk(10);

      startedListeningAt.current = null;

      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    }
  }, [asyncState.currentTrackId]);

  //#endregion

  //#region Subscriptions
  
  useSubscription(state => state.isPlaying, (isPlaying) => {
    if (!audioRef.current) return;

    if (isPlaying) {
      if (audioRef.current.readyState >= 2 && audioRef.current.paused) {
        // otherwise, will be caught by the "oncanplay" event
        if (audioRef.current) {
          ensureAudioContext();
          audioRef.current.play();
        }
      }
    }
    else {
      audioRef.current.pause();
    }
  });

  useEffect(() => {
    recordChunk(3000);
    startedListeningTrackId.current = asyncState.currentTrackId;
    startedListeningAt.current = null;

    if (!audioRef.current) return;

    if (asyncState.currentTrackId === null) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    else {
      TrackCache.getCachedTrack(asyncState.currentTrackId)
        .then((cached) => {
          if (cached && cached.type.split('/')[0] === 'audio') {
            audioRef.current!.src = URL.createObjectURL(cached);
          } else {
            audioRef.current!.src = api.filePath(`tracks/${asyncState.currentTrackId}/file`);
          }
        })
      ;
    }
  }, [asyncState.currentTrackId]);

  useSubscription(state => state.currentTrackId, async (currentTrackId, _, oldState) => {
    if (oldState.currentTrackId !== null) {
      api.patch(`/tracks/${oldState.currentTrackId}/settings`, oldState.tracks[oldState.currentTrackId].settings);
    }
  });

  useSubscription(state => state.volume, (volume) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  });

  useEffect(() => {
    if (gainNode.current) {
      const volume = currentTrackAsync?.settings.volume ?? 1;
      gainNode.current.gain.value = volume;
    }
  }, [currentTrackAsync?.settings.volume]);

  //#endregion

  //#region Global Event Listeners

  useGlobalEventListener('seekTime', seekTime);
  useGlobalEventListener('previousOrRestart', previousOrRestartTrigger.trigger);
  useGlobalEventListener('next', nextTrigger.trigger);

  //#endregion
  
  return (
    <audio
      crossOrigin="anonymous"
      ref={audioRef}
      onEnded={handleTrackEnd}
      onTimeUpdate={handleTimeUpdate}
      onCanPlay={playIfNeeded}
      onPlay={handlePlay}
      onPause={handlePause}
      onCanPlayThrough={cacheTrack}
    />
  );
}