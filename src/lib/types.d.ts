export interface Track
{
    id: string;
    metadata: TrackMetadata;
    settings: TrackSettings;
    listenEntries?: ListenEntry[];
}

export interface ListenEntry
{
    started: number; // timestamp
    ended: number; // seconds
}

export interface TrackMetadata
{
    title: string,
    artist: string,
    album: string,
    length: number,
    picture: string,
    track: number;
    modified: string;
}

export interface Playlist
{
    id: string;
    name: string;
    tracks: {
        id: string;
    }[];
    totalLength: number;
}

export interface TrackSettings
{
    volume: number; // multiplier
}