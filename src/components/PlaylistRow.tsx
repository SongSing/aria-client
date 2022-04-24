import { Playlist } from "../lib/types";
import AlbumArtStack from "./AlbumArtStack";

type Props = {
  playlist: Playlist,
  onClick?: () => any
};

export default function PlaylistRow(props: Props) {

  return (
    <button onClick={props.onClick} className="playlistRow">
      <AlbumArtStack
        overlap={2}
        size={64}
        trackIds={props.playlist.tracks.map(t => t.id)}
    />
      <div className="details">
        <div>
          {props.playlist.name}
        </div>
        <div>
          {props.playlist.tracks.length} tracks, {Math.round((props.playlist.totalLength || 0) / 60 / 60 * 10) / 10} hours
        </div>
      </div>
    </button>
  );
}