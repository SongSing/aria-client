import { useEffect, useMemo, useRef, useState } from "react";
import TrackImage from "../components/TrackImage";
import useApi from "../hooks/useApi";
import { spanWithClass } from "../lib/StyledComponents";
import { setState, useGlobalStateSlice } from "../state/GlobalState";

let Big = spanWithClass('big');
let Med = spanWithClass('med');
let Sub = spanWithClass('sub');

export default function Stats() {
  const { syncState, asyncState } = useGlobalStateSlice('tracks', 'currentTrackId');
  const api = useApi();
  const [totalHours, setTotalHours] = useState<number | null>(null);
  const [recent, setRecent] = useState<{id: string, totalHours: number, totalPlays: number}[]>([]);
  const [allTime, setAllTime] = useState<{id: string, totalHours: number, totalPlays: number}[]>([]);
  const headerRefs = [
    useRef<HTMLHeadingElement | null>(null),
    useRef<HTMLHeadingElement | null>(null),
  ];
  const firstNonHeaderRef = useRef<HTMLOListElement | null>(null);

  const numTracks = useMemo(() => Object.keys(asyncState.tracks).length, [asyncState.tracks]);

  const albums = useMemo(() => {
      const albums: Set<string> = new Set();
      Object.values(asyncState.tracks).forEach(track => albums.add(track.metadata.album.toLowerCase()));
      return Array.from(albums);
  }, [asyncState.tracks]);

  const artists = useMemo(() => {
      const artists: Set<string> = new Set();
      Object.values(asyncState.tracks).forEach(track => artists.add(track.metadata.artist.toLowerCase()));
      return Array.from(artists);
  }, [asyncState.tracks]);

  // const totalTimeListened = useMemo(() => {
  //     let sum = 0;

  //     Object.values(asyncState.tracks).forEach((track) =>
  //     {
  //         if (!track.listenEntries)
  //         {
  //             console.log(track);
  //         }
  //         track.listenEntries.forEach((entry) =>
  //         {
  //             sum += (entry.ended - entry.started);
  //         });
  //     });

  //     return sum;
  // }, [asyncState.tracks]);

  useEffect(() => {
    api.get('/tracks/stats')
      .then((res) => {
        setTotalHours(Math.round(res.body!.totalHours * 100) / 100);
        setRecent(res.body!.recent);
        setAllTime(res.body!.allTime);
      })
    ;
  }, [asyncState.currentTrackId]);

  // function handleScroll() {
  //   firstNonHeaderRef.current!.style.paddingTop = ``;

  //   let i = 0;
  //   let found = false;

  //   for (i = headerRefs.length - 1; i >= 0; i--) {
  //     if (headerRefs[i].current!.parentElement!.scrollTop > headerRefs[i].current!.offsetTop && !found) {
  //       headerRefs[i].current!.style.position = "fixed";
  //       firstNonHeaderRef.current!.style.paddingTop = `${headerRefs[i].current!.offsetHeight}px`;
        
  //       found = true;
  //     } else {
  //       headerRefs[i].current!.style.position = "";
  //     }
  //   }
  // }

  return (
    <div className="view stats">
      <div className="mainRow">
        <button className="nostyle" onClick={() => setState({ currentPage: 'tracks' })}>
          <Big>{numTracks}</Big> <Sub>tracks</Sub>
        </button>
        <button className="nostyle" onClick={() => setState({ currentPage: 'albums' })}>
          <Big>{albums.length}</Big> <Sub>albums</Sub>
        </button>
        <button className="nostyle">
          <Big>{artists.length}</Big> <Sub>artists</Sub>
        </button>
        <button className="nostyle">
          <Big>{totalHours === null ? '<Loading...>' : totalHours}</Big> <Sub>hours listened</Sub>
        </button>
      </div>
      <div className="summaries">
        <h2 ref={headerRefs[0]}>Last Week Summary</h2>
        <ol ref={firstNonHeaderRef} className="recentList">
          {recent.map((r, i) => (
            <li key={r.id}>
              <div className="number">{i + 1}.</div>
              <TrackImage track={asyncState.tracks[r.id]} />
              <div>
                <Med>{asyncState.tracks[r.id].metadata.artist} - {asyncState.tracks[r.id].metadata.title}</Med><br />
                <Sub>
                  {Math.round(r.totalPlays)} play{Math.round(r.totalPlays) === 1 ? '' : 's'},{'  '}
                  {Math.round(r.totalHours * 10) / 10} hours listened
                </Sub>
              </div>
            </li>
          ))}
        </ol>
        <h2 ref={headerRefs[1]}>All Time Summary</h2>
        <ol className="recentList">
          {allTime.map((r, i) => (
            <li key={r.id}>
              <div className="number">{i + 1}.</div>
              <TrackImage track={asyncState.tracks[r.id]} />
              <div>
                <Med>{asyncState.tracks[r.id].metadata.artist} - {asyncState.tracks[r.id].metadata.title}</Med><br />
                <Sub>
                  {Math.round(r.totalPlays)} play{Math.round(r.totalPlays) === 1 ? '' : 's'},{'  '}
                  {Math.round(r.totalHours * 10) / 10} hours listened
                </Sub>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}