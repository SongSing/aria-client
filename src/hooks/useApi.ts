import { useCallback } from "react";
import { http } from '@tauri-apps/api';
import useFetch from "./useFetch";

const baseUrl = 'http://10.0.0.22:9005';

function transformUrl(url: string) {
  if (url.startsWith(baseUrl)) {
    url = url.substr(baseUrl.length);
  }

  if (!url.startsWith('/')) {
    url = '/' + url;
  }

  return url;
}

export default function useApi() {
  const fetch = useFetch();

  const get = useCallback(<T extends Record<string, any> = Record<string, any>>(url: string) => {
    url = transformUrl(url);

    return new Promise<{ status: number, body?: T }>(async (resolve, reject) => {
      try {
        const res = await fetch<T>(baseUrl + url);
        resolve(res);
      } catch (e) {
        reject(e);
      }
    })
  }, []);

  const getFile = useCallback(async (url: string) => {
    url = transformUrl(url);

    const res = await window.fetch(baseUrl + url);

    if (res.status < 400) {
      return res.blob();
    } else {
      throw res.statusText;
    }
  }, []);

  const post = useCallback((url: string, body: Record<string, any>) => {
    url = transformUrl(url);

    return new Promise<{ status: number, body?: Record<string, any> }>(async (resolve, reject) => {
      try {
        const res = await fetch(baseUrl + url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body
        });

        resolve(res);
      } catch (e) {
        reject(e);
      }
    })
  }, []);

  const patch = useCallback(<T extends Record<string, any> = Record<string, any>>(url: string, body: Record<string, any>) => {
    url = transformUrl(url);

    return new Promise<{ status: number, body?: T }>(async (resolve, reject) => {
      try {
        const res = await fetch<T>(baseUrl + url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body
        });

        resolve(res);
      } catch (e) {
        reject(e);
      }
    })
  }, []);

  const del = useCallback(<T extends Record<string, any> = Record<string, any>>(url: string) => {
    url = transformUrl(url);

    return new Promise<{ status: number, body?: T }>(async (resolve, reject) => {
      try {
        const res = await fetch<T>(baseUrl + url, {
          method: 'DELETE'
        });
        
        resolve(res);
      } catch (e) {
        reject(e);
      }
    })
  }, []);

  const filePath = useCallback((url: string) => {
    url = transformUrl(url);
    
    return baseUrl + url.replace(/\\/g, '/');
  }, []);

  return {
    get,
    getFile,
    post,
    delete: del,
    patch,
    filePath
  };
}