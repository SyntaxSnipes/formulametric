import { useState, useEffect } from "react"
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
} from "@mui/x-charts/Gauge";

import GaugePointer from "./GaugePointer";

export default function MetricGauge(props) {
  const [animatedValue, setAnimatedValue] = useState(0);
  useEffect(() => {
    const sequence = [100, 90, 100, 95, 100, 95, 90, 85, props.value * 100];
    let step = 0;
    const animate = (from, to, duration = 300) => {
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const currentValue = from + (to - from) * progress;
        setAnimatedValue(currentValue);
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          step++;
          if (step < sequence.length) {
            animate(currentValue, sequence[step]);
          }
        }
      };
      requestAnimationFrame(tick);
    };
    animate(0, sequence[step]);
  }, [props.value]);

  return (
    <div className="flex flex-col items-center text-white">
      <GaugeContainer
        width={120}
        height={120}
        value={animatedValue}
        startAngle={-90}
        endAngle={90}
        sx={{ [`--gauge-color`]: props.color }}
      >
        <GaugeReferenceArc />
        <GaugeValueArc />
        <GaugePointer color={props.color} metricValue={animatedValue} />
      </GaugeContainer>
      <p className="text-sm text-white mt-1">{props.title}</p>
      <p className="text-xs text-white/60">{animatedValue.toFixed(1)}%</p>
    </div>
  );
}