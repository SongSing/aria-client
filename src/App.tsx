import React, { useEffect, useState } from 'react'
import logo from './logo.svg'
import tauriCircles from './tauri.svg'
import tauriWord from './wordmark.svg'
import './App.scss'
import { AppState, setState, useGlobalState, useGlobalStateSlice } from './state/GlobalState'
import Home from './pages/Home';
import Tracks from './pages/Tracks';
import NowPlaying from './components/NowPlaying'
import Player from './components/Player'
import Stats from './pages/Stats'
import Background from './components/Background'
import useApi from './hooks/useApi'
import Playlists from './pages/Playlists'

function App() {
  const { asyncState, syncState } = useGlobalStateSlice('currentPage');
  const api = useApi();

  useEffect(() => {
    api.get('/tracks')
      .then(({ status, body }) => {
        setState({ tracks: body?.tracks ?? {} });
        console.log(body);
      })
    ;
  }, []);

  return (
    <div className="app">
      <Background />
      <nav className="">
        <a onClick={() => setState({ currentPage: "home" })} className={asyncState.currentPage === "home" ? "active" : ""}>Home</a>
        <a onClick={() => setState({ currentPage: "tracks" })} className={asyncState.currentPage === "tracks" ? "active" : ""}>Tracks</a>
        <a onClick={() => setState({ currentPage: "playlists" })} className={asyncState.currentPage === "playlists" ? "active" : ""}>Playlists</a>
        <a onClick={() => setState({ currentPage: "albums" })} className={asyncState.currentPage === "albums" ? "active" : ""}>Albums</a>
        <a onClick={() => setState({ currentPage: "stats" })} className={asyncState.currentPage === "stats" ? "active" : ""}>Stats</a>
        <a onClick={() => setState({ currentPage: "settings" })} className={asyncState.currentPage === "settings" ? "active" : ""}>Settings</a>
      </nav>

      {asyncState.currentPage === 'home' && <Home />}
      {asyncState.currentPage === 'tracks' && <Tracks />}
      {asyncState.currentPage === 'stats' && <Stats />}
      {asyncState.currentPage === 'playlists' && <Playlists />}

      <NowPlaying />
      <Player />
    </div>
  )
}

export default App
