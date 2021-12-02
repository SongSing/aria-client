import localforage from "localforage";
import { useCallback } from "react";
import { FetchOptions } from "../../node_modules/@tauri-apps/api/http";
import useApi from "./useApi";
import useFetch from "./useFetch";
import * as uuid from 'uuid';

const dbName = 'aria';

const table = localforage.createInstance({
  name: dbName,
  storeName: 'apiCalls'
});

type CallEntry = {
  method: 'post',
  body?: Record<string, any>,
  url: string
};

export default function useEnsuredApi() {
  const api = useApi();

  const post = useCallback(async (url: string, body?: Record<string, any>) => {
    const id = uuid.v4();
    table.setItem<CallEntry>(id, { url, body, method: 'post' });

    api.post(url, body || {})
      .then(() => {
        table.removeItem(id);

        table.iterate<CallEntry, void>((value, key) => {
          api.post(value.url, value.body || {})
            .then(() => {
              table.removeItem(key);
            })
          ;
        });
      });
  }, []);

  return {
    post
  };
}

