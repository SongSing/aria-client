import styled from "styled-components";
import useCurrentTrack from "../hooks/useCurrentTrackAsync";
import { emitGlobalEvent } from "../lib/GlobalEvents";
import { Row } from "../lib/StyledComponents";
import { formatDuration } from "../lib/utils";
import { useGlobalState } from "../state/GlobalState";

const Seeker = styled.input`
  flex-grow: 1;
`;

export default function Seekbar() {
  const currentTrack = useCurrentTrack();
  const currentTime = useGlobalState(state => Math.floor(state.currentTime));

  return (<>
    <Row>
      <span>
        {formatDuration(currentTime)} / {formatDuration(currentTrack?.metadata.length ?? 0)}
      </span>
    </Row>
    <Seeker
      type="range"
      min={0}
      max={currentTrack?.metadata?.length ?? 0}
      step={currentTrack ? currentTrack.metadata.length / 100 : 1}
      value={currentTime}
      onChange={e => emitGlobalEvent('seekTime', e.currentTarget.valueAsNumber)}
    />
  </>);
}