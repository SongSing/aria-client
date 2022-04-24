import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import useApi from "../hooks/useApi";
import { setState, setTrack, useGlobalStateSlice } from "../state/GlobalState";

type Props = {
    trackId: string;
};

export default function TrackChart(props: Props) {
  const { asyncState, syncState } = useGlobalStateSlice('tracks');
  const [data, setData] = useState<any>([]);

  const api = useApi();

  useEffect(() => {
    api.get(`tracks/${props.trackId}/listenEntries`)
      .then(({ status, body }) => {
        if (body) {
          setState(setTrack(props.trackId, {
            listenEntries: body.listenEntries
          }));
        }
      })
    ;

    setData(asyncState.tracks[props.trackId].listenEntries ?? []);
  }, [props.trackId]);

  useEffect(() => {
    if (!asyncState.tracks[props.trackId].listenEntries) {
      setData([]);
      return;
    }

    let d: any[] = [];
    let bag = asyncState.tracks[props.trackId].listenEntries!.slice(0);

    for (let i = 0; i < 52 * 2; i++) {
      const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 7 * (i + 1);
      d.push({
        plays: 0,
        cutoff: new Date(cutoff).toDateString()
      });

      for (let j = 0; j < bag.length; j++) {
        if ((bag[j].started + bag[j].ended) / 2 >= cutoff) {
          const [le] = bag.splice(j, 1);
          d[i].plays += (le.ended - le.started) / (asyncState.tracks[props.trackId].metadata.length * 1000);
        }
      }
    }

    d.reverse();
    console.log(d);
    setData(d);
  }, [asyncState.tracks[props.trackId].listenEntries]);

  const tooltip = (args: any) => {
    const { active, payload, label } = args;

    if (!payload || payload.length === 0) {
      return <div></div>;
    }

    const { plays, cutoff } = payload[0].payload;

    return (
      <div className="chartTooltip">
        <div>
          <span className="label">Plays: </span>
          <span className="value">{Math.round(plays)}</span>
        </div>
        <div>
          <span className="label">Week: </span>
          <span className="value">{cutoff}</span>
        </div>
      </div>
    )
  };
  
  return (
    <div style={{ flexGrow: 1, flexShrink: 1 }}>
      <ResponsiveContainer width="99%" height={64}>
        <LineChart
          data={data}
          margin={{
            bottom: -8,
            left: -32
          }}
        >
          <CartesianGrid
            stroke="rgba(255,255,255,0.3)"
            strokeDasharray="1"
          />
          <YAxis
            dataKey="plays"
            stroke="rgba(255,255,255,0.7)"
          />
          <XAxis
            dataKey="cutoff"
            minTickGap={40}
            stroke="rgba(255,255,255,0.7)"
          />
          <Tooltip
            contentStyle={{color: 'black'}}
            content={tooltip}
            offset={32}
          />
          <Line
            type="monotone"
            dataKey="plays"
            stroke="#ffffff"
            yAxisId={0}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}