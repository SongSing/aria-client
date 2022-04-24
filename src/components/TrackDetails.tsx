import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Track } from "../lib/types";
import { LabelRow, Row } from "../lib/StyledComponents";
import NumberInput from "./NumberInput";
import { setState, setTrack, useGlobalStateSlice } from "../state/GlobalState";
import useApi from "../hooks/useApi";
import TrackChart from "./TrackChart";

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
  }, [track.id]);

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
          <div>Plays: {plays === null ? 'Loading...' : plays}</div>
        </LabelRow>
        <Row style={{ alignSelf: "stretch" }}>
          <TrackChart trackId={props.trackId} />
        </Row>
      </> : <span>No track selected</span>}
    </Wrapper>
  );
}