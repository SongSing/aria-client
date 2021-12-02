import React, { CSSProperties, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import useSingleAndDoubleClick from "../hooks/useSingleAndDoubleClick";
import { Track } from "../lib/types";
import TrackItem from "./TrackItem";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { array_remove, sign } from "../lib/utils";
import useCurrentTrack from "../hooks/useCurrentTrackSync";
import { setQueue, setState, useGlobalState, useGlobalStateSlice } from "../state/GlobalState";
import { emitGlobalEvent } from "../lib/GlobalEvents";
import useMemoSync from "../hooks/useMemoSync";
import useCurrentTrackAsync from "../hooks/useCurrentTrackAsync";

type SortType = "none" | "artist" | "album" | "title" | "modified";
type SortDirection = "ascending" | "descending";
type SortCriteria = {
  type: SortType,
  direction:  SortDirection
};

interface Props
{
  tracks?: string[]; // ids
  playOnDoubleClick?: boolean;
  useStickySelect?: boolean;
  onSelectionChange?: (selection: string[]) => any;
  defaultSort?: SortCriteria;
  // trackMenus?: CustomMenuItem[];
}

export default function TrackList(props: React.PropsWithChildren<Props>)
{
  const { asyncState, syncState } = useGlobalStateSlice('tracks', 'currentTrackId');

  const click = useSingleAndDoubleClick(handleClick, handleDoubleClick);
  const clickedTrackId = useRef<string | null>(null);
  const [ filterString, setFilterString ] = useState("");
  const [ sortCriteria, setSortCriteria ] = useState<SortCriteria>(
    props.defaultSort ?? {
      type: "none",
      direction: "ascending"
    }
  );

  const selectedTracksSync = useRef<string[]>([]);
  const [ selectedTracksAsync, setSelectedTracksAsync ] = useState<string[]>(selectedTracksSync.current);
  
  const listRef = useRef<List | null>(null);
  const playOnDoubleClick = props.playOnDoubleClick ?? true;
  const useStickySelect = props.useStickySelect ?? false;
  const currentTrackAsync = useCurrentTrackAsync();
  // // const showContextMenu = useContextMenu();

  const tracks = useMemoSync((...args) => {
    return props.tracks ?? Object.keys(syncState().tracks);
  }, () => [props.tracks, !props.tracks && syncState().tracks]);

  const sortedTracks = useMemoSync((tracks, stateTracks, ...rest) => {
    return tracks.map(s => stateTracks[s]).sort(sortFn);
  }, () => [tracks(), syncState().tracks, sortCriteria] as const);

  const filteredIds = useMemoSync((sortedTracks, ...rest) => {
    return sortedTracks.filter(filterFn).map(s => s.id);
  }, () => [sortedTracks(), filterString] as const);

  function performClick(id: string, ctrl: boolean, shift: boolean, preserveSelected: boolean = false): string[]
  {
    clickedTrackId.current = id;

    if (selectedTracksAsync.includes(id) && preserveSelected)
    {
      return selectedTracksAsync;
    }

    if (ctrl || useStickySelect)
    {
      if (shift)
      {
        if (selectedTracksAsync.length === 0 || selectedTracksAsync.includes(id))
        {
          return selectedTracksAsync;
        }
        
        let closest = selectedTracksAsync.sort((a, b) =>
        {
          return Math.abs(filteredIds().indexOf(a) - filteredIds().indexOf(id)) -
            Math.abs(filteredIds().indexOf(b) - filteredIds().indexOf(id));
        })[0];

        const cindex = filteredIds().indexOf(closest);
        const sindex = filteredIds().indexOf(id);
        
        const range = Math.abs(cindex - sindex);

        const start = Math.min(cindex, sindex);
        const end = start + range + 1;

        const s = Array.from(new Set(filteredIds().slice(start, end).concat(selectedTracksAsync)));
        selectedTracksSync.current = s;
      }
      else
      {
        if (selectedTracksAsync.includes(id))
        {
          const newArray = selectedTracksAsync.slice(0);
          array_remove(newArray, id);
          selectedTracksSync.current = newArray;
        }
        else
        {
          selectedTracksSync.current = selectedTracksAsync.concat(id);
        }
      }
    }
    else if (shift)
    {
        if (selectedTracksAsync.length === 0 || selectedTracksAsync.includes(id))
        {
          return selectedTracksAsync;
        }
        
        let closest = selectedTracksAsync.sort((a, b) =>
        {
          return Math.abs(filteredIds().indexOf(a) - filteredIds().indexOf(id)) -
            Math.abs(filteredIds().indexOf(b) - filteredIds().indexOf(id));
        })[0];

        const cindex = filteredIds().indexOf(closest);
        const sindex = filteredIds().indexOf(id);
        
        const range = Math.abs(cindex - sindex);

        const start = Math.min(cindex, sindex);
        const end = start + range + 1;

        selectedTracksSync.current = filteredIds().slice(start, end);
    }
    else
    {
      selectedTracksSync.current = [id];
    }
    
    setSelectedTracksAsync(selectedTracksSync.current);
    return selectedTracksSync.current;
  }

  function handleClick(e: React.MouseEvent)
  {
    const id = (e.target as HTMLDivElement)?.dataset?.id ?? null;
    if (id === null) return;

    performClick(id, e.ctrlKey, e.shiftKey);
  }

  useEffect(() => {
    if (props.onSelectionChange)
    {
      props.onSelectionChange(selectedTracksAsync);
    }
  }, [selectedTracksAsync]);

  function handleDoubleClick(e: React.MouseEvent)
  {
    if (!playOnDoubleClick) return;

    const id = (e.target as HTMLDivElement)?.dataset?.id ?? null;
    if (id === null) return;

    if (id !== clickedTrackId.current)
    {
      handleClick(e);
    }
    else
    {
      setState({
        currentTrackId: id,
        isPlaying: true
      }, setQueue(sortedTracks().map(t => t.id)));
    }
  }

  function handleContextMenu(e: React.MouseEvent)
  {
    // e.preventDefault();
    // const id = (e.target as HTMLDivElement)?.dataset?.id ?? null;
    // if (id === null) return;

    // const newSelected = performClick(id, e.ctrlKey, e.shiftKey, true);

    // showContextMenu([
    //   {
    //     label: "Add to Playlist",
    //     type: "subMenu",
    //     value: state.playlists.map((playlist) => ({
    //       label: playlist.name,
    //       value: {
    //         action: "addTracksToPlaylist",
    //         selectedTracks: newSelected,
    //         playlist: playlist.filename
    //       },
    //       type: "singleItem"
    //     }))
    //   },
    //   {
    //     label: "Rename",
    //     type: "subMenu",
    //     value: [
    //       {
    //         label: "Artist - Album - Title",
    //         type: "singleItem",
    //         value: {
    //           action: "rename",
    //           selectedTracks: newSelected,
    //           format: "%artist% - %album% - %title%.%ext%"
    //         }
    //       }
    //     ]
    //   },
    //   {
    //     label: "Consolidate Modified Times",
    //     type: "singleItem",
    //     value: {
    //       action: "consolidateModifiedTimes",
    //       selectedTracks: newSelected
    //     }
    //   },
    //   {
    //     label: "Refresh Metadata",
    //     type: "singleItem",
    //     value: {
    //       action: "refreshMetadata",
    //       selectedTracks: newSelected
    //     }
    //   },
    //   ...(props.trackMenus ?? [])
    // ]);
  }

  useLayoutEffect(() => {
    scrollToCurrent();
  }, [currentTrackAsync]);

  function sortFn(a: Track, b: Track)
  {
    if (sortCriteria.type === "none") return (sortCriteria.direction === "ascending" ? 1 : -1);

    if (a.metadata[sortCriteria.type] === b.metadata[sortCriteria.type])
    {
      return (a.metadata.track < b.metadata.track ? -1 : 1);
    }
    else
    {
      return (a.metadata[sortCriteria.type] < b.metadata[sortCriteria.type] ? 1 : -1) *
        (sortCriteria.direction === "ascending" ? 1 : -1);
    }
  }

  function filterFn(track: Track)
  {
    const toCheck = [track.metadata.album, track.metadata.artist, track.metadata.title];

    return toCheck.some(t => t.toLowerCase().includes(filterString.toLowerCase()));
  }

  function scrollToCurrent()
  {
    if (currentTrackAsync)
    {
      listRef.current?.scrollToItem(sortedTracks().findIndex(t => t.id === currentTrackAsync.id), "smart");
    }
  }

  const track: (args: {data: typeof trackItemData, index: number, style: CSSProperties}) => any = useCallback(({ data, index, style }) => {
    console.log(index);
    return (
      <TrackItem
        index={index}
        style={style}
        key={data.filteredIds[index]}
        track={data.tracks[data.filteredIds[index]]}
        selected={data.selectedTracks.includes(data.filteredIds[index])}
        isPlaying={data.filteredIds[index] === data.currentTrackId}
      />
    );
    }, []);

  const trackItemData = useMemo(() => ({
    filteredIds: filteredIds(),
    selectedTracks: selectedTracksAsync,
    tracks: asyncState.tracks,
    currentTrackId: asyncState.currentTrackId
  }), [filteredIds(), selectedTracksAsync, asyncState.tracks, asyncState.currentTrackId]);

  return (<div className="tracklist-component">
    <div className="tracktop">
      <div className="group">
        <span className="label">Sort: </span>
        <select
          value={sortCriteria.type}
          onChange={(e) => setSortCriteria({ type: e.currentTarget.value as any, direction: sortCriteria.direction })}
        >
          <option value="none">None</option>
          <option value="modified">Modified</option>
          <option value="title">Title</option>
          <option value="album">Album</option>
          <option value="artist">Artist</option>
        </select>
        <select
          value={sortCriteria.direction}
          onChange={(e) => setSortCriteria({ type: sortCriteria.type, direction: e.currentTarget.value as any })}
        >
          <option value="ascending">Ascending</option>
          <option value="descending">Descending</option>
        </select>
      </div>
      <div className="group">
        <span className="label">Filter: </span>
        <input
          type="text"
          value={filterString}
          onInput={(e) => setFilterString(e.currentTarget.value)}
        />
      </div>
      {currentTrackAsync && <button
        onClick={scrollToCurrent}
      >
        Go to Current
      </button>}
      {props.children}
    </div>
    <div className="tracklist-container" onClick={click} onContextMenu={handleContextMenu}>
      <AutoSizer>
        {(size: { width: number, height: number }) => (
          <List
            className="tracklist"
            width={size.width}
            height={size.height}
            itemCount={filteredIds().length}
            itemSize={64}
            ref={listRef}
            itemData={trackItemData}
          >
            {track}
          </List>
        )}
      </AutoSizer>
    </div>
  </div>);
}