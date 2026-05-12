import { useGaugeState } from "@mui/x-charts/Gauge";

//function to render the pointer of the gauge chart
export default function GaugePointer({ color }) {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();

  if (valueAngle === null) return null;

  //calculating the target position for the pointer based on the value angle and outer radius of the gauge
  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };

  return (
    <g style={{ pointerEvents: 'none' }}>
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill={color}
        style={{ willChange: 'transform' }}
      />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        style={{ willChange: 'transform' }}
      />
    </g>
  );
}
