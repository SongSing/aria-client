import { faBackward, faBars, faForward, faPause, faPlay, faRandom, faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import styled from "styled-components";
import useCurrentTrackAsync from "../hooks/useCurrentTrackAsync";
import { emitGlobalEvent } from "../lib/GlobalEvents";
import { NarrowRow, Row } from "../lib/StyledComponents";
import { formatDuration, sliceObject } from "../lib/utils";
import { getGlobalState, setState, toggleShuffle, useGlobalState, useGlobalStateSlice } from "../state/GlobalState";
import Seekbar from "./Seekbar";
import TrackDetails from "./TrackDetails";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.75rem 1rem;
  align-items: stretch;
  
  transition: height 1s;
`;

const MainWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  justify-content: stretch;

  audio
  {
    flex-grow: 1;
  }

  .bars
  {
    cursor: pointer;
  }

  .shuffle
  {
    color: rgba(255,255,255,0.5);
    cursor: pointer;

    &.active
    {
      color: white;
    }
  }

  @media screen and (max-width: 1280px) {
    flex-direction: column;
    align-items: normal;

    & > * {
      justify-content: center;
    }
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: calc(50% - 4.25rem);
  flex-grow: 0;

  @media screen and (max-width: 1280px) {
    flex-direction: row;
    width: auto;
    align-items: baseline;
    justify-content: flex-start;
  }
  
  @media screen and (max-width: 680px) {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }
`;

const Primary = styled.div`
  font-size: 1.5rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;

  @media screen and (max-width: 1280px) {
    width: auto;
    margin-right: 0.5rem;
  }
`;

const Secondary = styled.div`
  color: rgba(255,255,255,0.8);
  font-style: italic;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const SeekerAndVolume = styled.div`
  display: flex;
  gap: 1rem;
  flex-grow: 1;

  @media screen and (max-width: 680px) {
    flex-direction: column;
  }

  & > div {
    display: flex;
    gap: 1rem;

    &.seekGroup {
      flex-grow: 2;
    }

    .volumeRow {
      flex-grow: 1;

      input {
        flex-grow: 1;
      }
    }
  }
`;

export default function NowPlaying() {
  const { asyncState, syncState} = useGlobalStateSlice('isPlaying', 'volume', 'isShuffling');
  const currentTrack = useCurrentTrackAsync();
  const [isShowingDetails, setIsShowingDetails] = useState(false);

  function toggleTrackDetails() {
    setIsShowingDetails(prev => !prev);
  }

  function togglePlay() {
    setState(state => ({ isPlaying: !state.isPlaying }));
  }

  function prev() {
    emitGlobalEvent('previousOrRestart');
  }

  function next() {
    emitGlobalEvent('next');
  }

  // useEffect(() =>
  // {
  //   function handleMediaShortcut(e: IpcRendererEvent, shortcut: string)
  //   {
  //     switch (shortcut)
  //     {
  //       case "next":
  //         next();
  //         break;
  //       case "previous":
  //         prev();
  //         break;
  //       case "togglePlay":
  //         togglePlay();
  //     }
  //   }

  //   ipcRenderer.addListener("media-shortcut", handleMediaShortcut);

  //   return () =>
  //   {
  //     ipcRenderer.removeListener("media-shortcut", handleMediaShortcut);
  //   }
  // });

  return (
    <Wrapper className="nowPlaying">
      <MainWrapper>
        <Info>
          <Primary>{currentTrack?.metadata.title ?? "--"}</Primary>
          <Secondary>{currentTrack?.metadata.artist ?? "--"} — {currentTrack?.metadata.album ?? "--"}</Secondary>
        </Info>
        <Row className="rem1-5 controls">
          <FontAwesomeIcon
            className="clicky"
            icon={faBackward}
            onClick={() => prev()}
            onMouseDown={e => { e.preventDefault(); }}
          />
          <FontAwesomeIcon
            className="clicky"
            icon={asyncState.isPlaying ? faPause : faPlay}
            onClick={togglePlay}
            onMouseDown={e => { e.preventDefault(); }}
          />
          <FontAwesomeIcon
            className="clicky"
            icon={faForward}
            onClick={() => next()}
            onMouseDown={e => { e.preventDefault(); }}
          />
        </Row>
        <SeekerAndVolume>
          <div className="seekGroup">
            <Seekbar />
          </div>
          <div>
            <NarrowRow className="volumeRow">
              <FontAwesomeIcon icon={faVolumeUp} />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={asyncState.volume}
                onChange={e => setState({ volume: e.currentTarget.valueAsNumber })}
              />
            </NarrowRow>
            <FontAwesomeIcon icon={faRandom} onClick={() => setState(toggleShuffle)} className={"shuffle" + (asyncState.isShuffling ? " active" : "")} />
            <FontAwesomeIcon icon={faBars} className="bars" onClick={toggleTrackDetails} />
          </div>
        </SeekerAndVolume>
      </MainWrapper>
      {isShowingDetails && currentTrack && <TrackDetails trackId={currentTrack.id} />}
    </Wrapper>
  );
}