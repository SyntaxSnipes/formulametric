import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
} from "@mui/x-charts/Gauge";

import GaugePointer from "./GaugePointer";

//creating MetricGauge component to display a gauge chart for a specific performance metric, with the value, title, and color passed as props
export default function MetricGauge({value, title, color}) {
  return (
    <div className="flex flex-col items-center text-white z-0">
      <GaugeContainer
        min={0}
        max={100}
        value={value * 100} //value as a percentage
        startAngle={-90}
        endAngle={90}
      >
        <GaugeReferenceArc />
        <GaugeValueArc />
        <GaugePointer color={color} metricValue={value * 100} />
      </GaugeContainer>
      <p className="text-sm text-white mt-1">{title}</p>
      <p className="text-xs text-white/60">{(value * 100).toFixed(1)}%</p> {/*displaying the value as a percentage with 1 decimal place*/}
    </div>
  );
}
