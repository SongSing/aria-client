import React, { useCallback, useContext, useState } from "react";
import { Track } from "../lib/types";
import defaultThumb from "../assets/default.png";
import { classList } from "../lib/utils";
// import styled from "styled-components";
import useApi from "../hooks/useApi";
import useTrackArt from "../hooks/useTrackArt";
import useCurrentTrackAsync from "../hooks/useCurrentTrackAsync";

interface Props
{
  track: Track;
}

// const BottomRow = styled.div`
//   color: rgba(255,255,255,0.7);
//   font-style: italic;
// `;

export default function TrackImage(props: Props)
{
  const imgSrc = useTrackArt(props.track);

  return (
    <img src={imgSrc} onError={(e) => e.currentTarget.src = defaultThumb} className="thumb"></img>
  );
}