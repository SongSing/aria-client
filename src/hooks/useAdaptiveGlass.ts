import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGlobalStateSlice } from "../state/GlobalState";
import useTrackArt from "./useTrackArt";

interface Props
{
  songId?: string | null;
  alpha?: number;
}

function isItDark(imageSrc: string, callback: (value: number) => any) {
  var fuzzy = 0.1;
  var img = document.createElement("img");
  img.src = imageSrc;
  img.style.display = "none";
  document.body.appendChild(img);
  
  img.onload = function() {
    const img = this as HTMLImageElement;
    // create canvas
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    
    var ctx = canvas.getContext("2d");
    ctx!.drawImage(img,0,0);
    
    var imageData = ctx!.getImageData(0,0,canvas.width,canvas.height);
    var data = imageData.data;
    var r,g,b, max_rgb;
    var light = 0, dark = 0;
    
    for(var x = 0, len = data.length; x < len; x+=4) {
      r = data[x];
      g = data[x+1];
      b = data[x+2];
      
      max_rgb = Math.max(Math.max(r, g), b);
      if (max_rgb < 128)
      dark++;
      else
      light++;
    }
    
    var dl_diff = ((light - dark) / (img.width*img.height));
    callback(dl_diff);
  }
}

const cache = new Map<string, number>();

export default function useAdaptiveGlass(props: Props = {})
{
  const { asyncState, syncState } = useGlobalStateSlice('currentTrackId', 'tracks');
  const [backgroundColor, setBackgroundColor] = useState<string | undefined>(undefined);
  const trackId = props.songId ?? asyncState.currentTrackId;
  const artSrc = useTrackArt(trackId ? asyncState.tracks[trackId] : null);

  useLayoutEffect(() =>
  {
    props = {
      songId: trackId,
      alpha: props.alpha ?? 0.8
    };

    const currentSong = props.songId === null ? null : asyncState.tracks[props.songId!];
    const filename = artSrc;

    function doIt(lightness: number)
    {
      const val = 0.6 + (((lightness + 1) / 2)) * 0.25;
      setBackgroundColor(`rgba(0,0,0,${val})`);
    }

    if (filename)
    {
      if (cache.has(filename))
      {
        doIt(cache.get(filename)!);
      }
      else
      {
        isItDark(filename, (lightness) =>
        {
          doIt(lightness);
          cache.set(filename, lightness);
        });
      }
    }
    else
    {
      setBackgroundColor(undefined);
    }
  }, [props, asyncState.currentTrackId]);

  return backgroundColor;
}