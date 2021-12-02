import { useEffect } from "react";
import TrackList from "../components/TrackList";
import useApi from "../hooks/useApi";
import { setState } from "../state/GlobalState";

export default function Tracks() {
  const api = useApi();

  return (
    <div className="view tracks">
      <TrackList
        defaultSort={{
          direction: 'ascending',
          type: 'modified'
        }}
      />
    </div>
  )
}