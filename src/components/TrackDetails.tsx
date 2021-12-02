import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Track } from "../lib/types";
import { LabelRow, Row } from "../lib/StyledComponents";
import NumberInput from "./NumberInput";
import { setState, setTrack, useGlobalStateSlice } from "../state/GlobalState";
import useApi from "../hooks/useApi";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 0.5rem;
  align-items: flex-start;
`;

interface Props
{
  trackId: string;
}

export default function TrackDetails(props: Props)
{
  const { asyncState, syncState } = useGlobalStateSlice('tracks');
  const track = useMemo(() => asyncState.tracks[props.trackId], [props.trackId, asyncState.tracks]);
  const [plays, setPlays] = useState<number | null>(null);
  const api = useApi();

  useEffect(() => {
    api.get(`/tracks/${track.id}/playCount`)
      .then((res) => {
        console.log(res);
        setPlays(Math.round(res.body?.totalPlays ?? -1))
      })
    ;
  }, [track]);

  function handleVolumeChange(volume: number)
  {
    if (isNaN(volume)) return;
    
    setState(setTrack(props.trackId, {
      settings: {
        volume
      }
    }));
  }

  return (
    <Wrapper>
      {track ? <>
        <div className="title">Title: {track.metadata.title}</div>
        <div className="artist">Artist: {track.metadata.artist}</div>
        <div className="album">Album: {track.metadata.album}</div>
        <LabelRow>
          <span>Volume Modifier:</span>
          <input
            type="range"
            min={0}
            max={4}
            value={track.settings.volume}
            step={0.1}
            onChange={(e) => handleVolumeChange(parseFloat(e.currentTarget.value))}
          />
          <NumberInput
            value={track.settings.volume}
            min={0}
            max={4}
            step={0.1}
            onChange={handleVolumeChange}
            roundPlaces={1}
          />
        </LabelRow>
        <Row>
          Plays: {plays === null ? 'Loading...' : plays}
        </Row>
      </> : <span>No track selected</span>}
    </Wrapper>
  );
}