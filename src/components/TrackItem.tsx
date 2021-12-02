import React, { useCallback, useContext, useState } from "react";
import { Track } from "../lib/types";
import defaultThumb from "../assets/default.png";
import { classList } from "../lib/utils";
// import styled from "styled-components";
import useApi from "../hooks/useApi";
import useTrackArt from "../hooks/useTrackArt";
import useCurrentTrackAsync from "../hooks/useCurrentTrackAsync";
import TrackImage from "./TrackImage";

interface Props
{
  track: Track;
  selected: boolean;
  isPlaying: boolean;
  style?: React.CSSProperties;
  index: number;
}

// const BottomRow = styled.div`
//   color: rgba(255,255,255,0.7);
//   font-style: italic;
// `;

export default function TrackItem(props: Props)
{
  const api = useApi();

  const imgSrc = useTrackArt(props.track);

  return (
    <div
      className={classList([
        "trackItem",
        props.selected && "selected",
        (props.index % 2 === 0 ? "even" : "odd"),
        props.isPlaying && "playing"
      ])}
      style={props.style}
      data-index={props.index}
      data-id={props.track.id}
    >
      <TrackImage track={props.track} />
      <div className="rows">
        <div className="title">{props.track.metadata.title}</div>
        <div className="bottomRow">
          <span className="artist">{props.track.metadata.artist}</span>
          <span> — </span>
          <span className="album">{props.track.metadata.album} [{props.track.metadata.track}]</span>
        </div>
      </div>
    </div>
  );
}