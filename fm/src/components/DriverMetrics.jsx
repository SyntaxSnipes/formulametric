import MetricGauge from "./Gauge/MetricGauge";

export default function DriverMetrics({ driver }) {
  return (
    <>
      <h2 className="text-xl sm:text-4xl">{driver?.FirstName}'s Metrics</h2>
      <div className="grid grid-cols-3 gap-1 sm:flex sm:flex-row sm:gap-1 sm:justify-center sm:items-center sm:overflow-x-auto mt-1">
        <MetricGauge
          title="Trajectory Score"
          value={driver?.PTrajectory}
          color="#22c55e"
        />
        <MetricGauge
          title="Absolute Score"
          value={driver?.PAbsolute}
          color="#eab308"
        />
        <MetricGauge
          title="Consistency Score"
          value={driver?.PConsistency}
          color="#3b82f6"
        />
        <MetricGauge
          title="Relative Score"
          value={driver?.PRelative}
          color="#a855f7"
        />
        <MetricGauge
          title="Aggregate Score"
          value={driver?.PAggregate}
          color="#ef4444"
        />
      </div>{" "}
    </>
  );
}
