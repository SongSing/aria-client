import { useRef } from "react";
import useAdaptiveGlass from "../hooks/useAdaptiveGlass";
import useCurrentTrackAsync from "../hooks/useCurrentTrackAsync";
import useTrackArt from "../hooks/useTrackArt";

export default function Background() {
  const imgSrc = useTrackArt(useCurrentTrackAsync());
  const backgroundColor = useAdaptiveGlass();

  return (<>
    <img className="background-image glassy" src={imgSrc} />
    <div
      className="background"
      style={{
        backgroundColor
      }}
    ></div>
  </>);
}