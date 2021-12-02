import { useCallback } from "react";
import { isTauri } from "../lib/utils";
import { http } from '@tauri-apps/api';

type FetchOptions = {
  headers?: Record<string, any>;
  body?: Record<string, any>;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
};

export default function useFetch() {
  const fetch = useCallback(<T extends Record<string, any> = Record<string, any>>(path: string, options?: FetchOptions) => {
    const method = options?.method || 'GET';
    const body = options?.body;

    return new Promise<{ status: number, body?: T }>(async (resolve, reject) => {
      try {
        if (isTauri()) {
          const res = await http.fetch<Record<string, any> | undefined>(path, {
            method,
            body: body ? http.Body.json(body) : undefined,
            headers: options?.headers
          });

          if (res.status < 400) {
            resolve({
              status: res.status,
              body: res.data as T
            });
          } else {
            reject(res.data?.message || '')
          }
        } else {
          const res = await window.fetch(path, {
            body: body ? JSON.stringify(body) : undefined,
            headers: options?.headers,
            method
          });
          
          let json: T | undefined = undefined;

          try {
            json = await res.json();
          } catch {}

          if (res.status < 400) {
            resolve({
              status: res.status,
              body: json
            });
          } else {
            reject(json?.message || '')
          }
        }
      } catch(e) {
        reject(e);
      }
    });
  }, []);

  return fetch;
}