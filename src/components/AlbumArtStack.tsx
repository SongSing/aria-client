import React, { useMemo, useState } from "react";
import { useGlobalStateSlice } from "../state/GlobalState";
import defaultThumb from "../assets/default.png";
import useTrackArt from "../hooks/useTrackArt";

interface Props
{
  trackIds: string[];
  size: number;
  overlap: number;
}

export default function AlbumArtStack(props: Props)
{
  const { asyncState } = useGlobalStateSlice('tracks');

  const tracksToUse = useMemo(() => {
    const albumCounts: Record<string, number> = {};
    const albumToId: Record<string, string> = {};

    props.trackIds.forEach((trackId) => {
      const album = asyncState.tracks[trackId].metadata.album.toLowerCase();

      if (!albumToId[album]) {
        albumToId[album] = trackId;
        albumCounts[album] = 0;
      }

      albumCounts[album]++;
    });

    return Object.entries(albumCounts).sort((a, b) => b[1] - a[1]).map(e => asyncState.tracks[albumToId[e[0]]]);
  }, [props.trackIds]);

  const trackArts = [
    useTrackArt(tracksToUse[0]),
    useTrackArt(tracksToUse[1]),
    useTrackArt(tracksToUse[2]),
  ];

  const max = trackArts.length;

  return (
    <div
      style={{
        width: props.size + (max - 1) * (props.size / props.overlap),
        height: props.size,
        position: "relative"
      }}
    >
      {trackArts.map((src, i) =>
      (
        <img
          src={src}
          style={{
            position: "absolute",
            left: `${i * (props.size / props.overlap)}px`,
            zIndex: max - i,
            borderRight: `${props.size / 64}px solid rgba(0,0,0,0.5)`,
            boxSizing: "content-box",
          }}
          width={props.size}
          height={props.size}
          key={`albumStack-${i}`}
        />
      ))}
    </div>
  );
}