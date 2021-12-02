import { useCallback } from 'react';
import { Track } from '../lib/types';
import { getGlobalState } from '../state/GlobalState';
import useApi from './useApi';

export default function useApiExtensions(api: ReturnType<typeof useApi>) {
  const getTrack = useCallback(async (track: Track) => {
    return await api.getFile(api.filePath(`tracks/${track.id}/file`));
  }, []);

  return {
    getTrack
  }
}