import { faAngleLeft, faArrowDown, faArrowUp, faEdit, faFileArchive, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useRef, useState } from "react";
import PlaylistRow from "../components/PlaylistRow";
import TrackList from "../components/TrackList";
import useApi from "../hooks/useApi";
import { Playlist } from "../lib/types";
import { array_copy, array_swap, mod } from "../lib/utils";
import { removePlaylist, setState, upsertPlaylist, useGlobalStateSlice } from "../state/GlobalState";

export default function Playlists() {
  const api = useApi();
  const { syncState, asyncState } = useGlobalStateSlice('playlists', 'tracks');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const selectedTracks = useRef<string[]>([]);
  const activePlaylist = useMemo(() => {
    return asyncState.playlists.find(p => p.id === selectedPlaylist) ?? null;
  }, [selectedPlaylist, selectedPlaylist !== null && asyncState.playlists.find(p => p.id === selectedPlaylist)]);
  const [editingName, setEditingName] = useState<string | null>(null);

  useEffect(() => {
    api.get('/playlists')
      .then((res) => {
        setState({
          playlists: res.body! as Playlist[]
        })
      })
    ;
  }, []);

  function makeNewPlaylist() {
    api.post('/playlists', {})
      .then((res) => {
        console.log(res);
        setState({
          playlists: [res.body! as Playlist].concat(asyncState.playlists)
        })
      })
    ;
  }

  function moveUp() {
    if (selectedTracks.current.length === 1)
    {
      let newTracks = activePlaylist!.tracks.map(t => t.id);
      array_swap(
        newTracks,
        newTracks.indexOf(selectedTracks.current[0]),
        mod(newTracks.indexOf(selectedTracks.current[0]) - 1, newTracks.length)
      );
    }
  }

  function moveDown()
  {
    if (selectedTracks.current.length === 1)
    {
      let newTracks = activePlaylist!.tracks.map(t => t.id);

      array_swap(
        newTracks,
        newTracks.indexOf(selectedTracks.current[0]),
        mod(newTracks.indexOf(selectedTracks.current[0]) + 1, newTracks.length)
      );
    }
  }

  function exportZip()
  {
    if (!activePlaylist) return;
  }

  function deactivatePlaylist() {
    setSelectedPlaylist(null);
  }

  function saveName() {
    api
      .patch(`/playlists/${activePlaylist!.id}`, {
        name: editingName
      })
      .then((res) => {
        console.log(res);
        setState(upsertPlaylist(res.body as Playlist));
        console.log(syncState().playlists);
      })
    ;
    setEditingName(null);
  }

  function deletePlaylist() {
    api
      .delete(`/playlists/${activePlaylist!.id}`)
      .then((res) => {
        setState(removePlaylist(activePlaylist!));
        deactivatePlaylist();
      })
    ;
  }

  return (
    <div className="view playlists" style={{ padding: activePlaylist ? "0" : undefined }}>
      {selectedPlaylist === null &&
        <div className="playlistList">
          <button onClick={makeNewPlaylist}>+ New Playlist</button>
          {asyncState.playlists.map((playlist) => (
            <PlaylistRow
              playlist={playlist}
              key={playlist.id}
              onClick={() => setSelectedPlaylist(playlist.id)}
            />
          ))}
        </div>
      }
      {activePlaylist !== null &&
        <div className="playlistContainer">
          <div className="titleRow">
            <button onClick={deactivatePlaylist}>
              <FontAwesomeIcon icon={faAngleLeft} /> Back
            </button>

            {editingName !== null ? <>
              <input
                type="text"
                value={editingName}
                onChange={e => setEditingName(e.currentTarget.value)}
              />
              <button onClick={saveName}><FontAwesomeIcon icon={faSave} /> Save Name</button>
            </> : <>
              <h1 className="playlistHeader">{activePlaylist.name}</h1>
              <button onClick={() => setEditingName(activePlaylist.name)}><FontAwesomeIcon icon={faEdit} /> Edit Name</button>
              <button className="delete" onClick={() => deletePlaylist()}><FontAwesomeIcon icon={faTimes} /> Delete</button>
            </>
            }

          </div>
          <TrackList
            tracks={activePlaylist?.tracks.map(t => t.id) || []}
            onSelectionChange={s => selectedTracks.current = s}
            // trackMenus={trackMenu}
          >
            <button onClick={moveUp}><FontAwesomeIcon icon={faArrowUp} /> Move Up</button>
            <button onClick={moveDown}><FontAwesomeIcon icon={faArrowDown} /> Move Down</button>
            <button onClick={exportZip}><FontAwesomeIcon icon={faFileArchive} /> Zip</button>
          </TrackList>
        </div>
      }
    </div>
  )
}