import localforage from "localforage";

const dbName = 'aria';

const trackFileTable = localforage.createInstance({
  name: dbName,
  storeName: 'trackFiles'
});

const imageTable = localforage.createInstance({
  name: dbName,
  storeName: 'images'
});

export default class TrackCache {
  public static cacheTrack(id: string, blob: Blob) {
    return trackFileTable.setItem(id, blob);
  }

  public static getCachedTrack(id: string) {
    return trackFileTable.getItem<Blob>(id);
  }

  public static async isTrackCached(id: string): Promise<boolean> {
    const cached = await this.getCachedTrack(id);
    return !!cached && cached.type.split('/')[0] === 'audio';
  }

  public static cacheArt(id: string, blob: Blob) {
    return imageTable.setItem(id, blob);
  }

  public static getCachedArt(id: string) {
    return imageTable.getItem<Blob>(id);
  }
}