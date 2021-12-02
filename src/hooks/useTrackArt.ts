import { Track } from "../lib/types";
import useApi from "./useApi";
import defaultThumb from "../assets/default.png";
import TrackCache from "../lib/TrackCache";
import { useEffect, useRef, useState } from "react";

const cache = new Map<string, string>();

export default function useTrackArt(track: Track | null) {
  const initialUri = track && cache.has(track.id) ? cache.get(track.id)! : defaultThumb;
  const api = useApi();
  const [uri, setUri] = useState<string>(initialUri);
  const uriRef = useRef(initialUri);
  const fetchingFor = useRef(track?.id ?? null);
  const isMounted = useRef(false);
  const currentTrack = useRef<Track | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    }
  }, []);

  useEffect(() => {
    currentTrack.current = track;
  }, [track]);

  useEffect(() => {
    if (!track) return;

    if (!cache.has(track.id)) {
      TrackCache.getCachedArt(track.id)
        .then((blob) =>
        {
          if (blob)
          {
            if (isMounted.current) {
              uriRef.current = URL.createObjectURL(blob);
              setUri(uriRef.current);
            }
            
            cache.set(track.id, uriRef.current);
          }
          else
          {
            setTimeout(() =>
            {
              if (!isMounted.current) return;
              api.getFile(`data/images/${track.id}.thumb.png`)
                .then((blob) =>
                {
                  TrackCache.cacheArt(track.id, blob);
                  const uri = URL.createObjectURL(blob);
                  cache.set(track.id, uri);

                  if (isMounted.current && track.id === currentTrack.current?.id) {
                    uriRef.current = uri;
                    setUri(uriRef.current);
                  }
                })
                .catch(() => {
                  if (isMounted.current && track.id === currentTrack.current?.id) {
                    uriRef.current = defaultThumb;
                    setUri(uriRef.current);
                  }
                })
              ;
            }, 1000);
          }
        })
      ;
    } else {
      const uri = cache.get(track.id)!;
      uriRef.current = uri;
      setUri(uriRef.current);
    }
  }, [track]);
  
  return uri;
}