import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
} from "@mui/x-charts/Gauge";

import GaugePointer from "./GaugePointer";

export default function MetricGauge({value, title, color}) {
  return (
    <div className="flex flex-col items-center text-white">
      <GaugeContainer
        min={0}
        max={100}
        value={value}
        startAngle={-90}
        endAngle={90}
      >
        <GaugeReferenceArc />
        <GaugeValueArc />
        <GaugePointer color={color} metricValue={value} />
      </GaugeContainer>
      <p className="text-sm text-white mt-1">{title}</p>
      <p className="text-xs text-white/60">{value.toFixed(1)}%</p>
    </div>
  );
}
