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
        width={120}
        height={120}
        value={value * 100}
        startAngle={-90}
        endAngle={90}
        sx={{ [`--gauge-color`]: color }}
      >
        <GaugeReferenceArc />
        <GaugeValueArc />
        <GaugePointer color={color} metricValue={value * 100} />
      </GaugeContainer>
      <p className="text-sm text-white mt-1">{title}</p>
      <p className="text-xs text-white/60">{(value * 100).toFixed(1)}%</p>
    </div>
  );
}