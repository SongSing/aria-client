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
    <div className="nowPlaying">
      <div className="mainWrapper">
        <div className="info">
          <div className="primary">{currentTrack?.metadata.title ?? "--"}</div>
          <div className="secondary">{currentTrack?.metadata.artist ?? "--"} — {currentTrack?.metadata.album ?? "--"}</div>
        </div>
        <div className="controls">
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
        </div>
        <div className="seekGroup">
          <Seekbar />
        </div>
        <div className="etc">
          <div className="volumeRow">
            <FontAwesomeIcon icon={faVolumeUp} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={asyncState.volume}
              onChange={e => setState({ volume: e.currentTarget.valueAsNumber })}
            />
          </div>
          <FontAwesomeIcon icon={faRandom} onClick={() => setState(toggleShuffle)} className={"shuffle" + (asyncState.isShuffling ? " active" : "")} />
          <FontAwesomeIcon icon={faBars} className="bars" onClick={toggleTrackDetails} />
        </div>
      </div>
      {isShowingDetails && currentTrack && <TrackDetails trackId={currentTrack.id} />}
    </div>
  );
}