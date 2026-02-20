import { useEffect, useState, CSSProperties } from "react";
import fmlogo from "/fmicon.png";
import BeatLoader from "react-spinners/BeatLoader";
import { LineChart } from "@mui/x-charts/LineChart";

import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from "@mui/x-charts/Gauge";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import driverImages from "./assets/icons/driverImages";
import flags from "./assets/icons/flags";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [year, setYear] = useState("2022");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); // Set loading to true whenever the year changes or the page is refreshed
    fetch(`http://localhost:5000/api/drivers/${year}`)
      .then((res) => res.json())
      .then((data) => {
        setDrivers(data);
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((err) => {
        console.error("Error fetching drivers:", err);
        setLoading(false); // Set loading to false even if there's an error
      });
  }, [year]);

  function decideDriverFlag(driver) {
    if (!driver?.Country) return null;

    const key = driver.Country.replace(/\s+/g, "")
      .replace("-", "")
      .replace("Republic", "")
      .trim();
    const formattedKey =
      key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();

    const flag = flags[formattedKey];

    if (!flag) {
      console.warn(`Flag not found for key: ${formattedKey}`);
      return null;
    }

    return (
      <img
        src={flag}
        alt={driver.Country}
        className="w-[30px] h-[20px] object-cover rounded-sm"
      />
    );
  }

  function normalizeName(name) {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function decideDriverIcon(driver, year) {
    if (!driver || !driver.LastName || !year) return null;

    const key = normalizeName(driver.LastName); // This is to handle the edgecase with special letter "hülkenberg" -> "hulkenberg"
    const img = driverImages[key]?.[year];

    if (!img) {
      console.warn(`Image not found for: ${key}, year: ${year}`);
      return null;
    }

    return (
      <img
        src={img}
        alt={driver.LastName}
        className="w-[110px] h-full object-cover rounded-s-xl"
      />
    );
  }

  const [selectedDrivers, setSelectedDrivers] = useState([]);

  return (
    <>
      <div className="drivers w-screen text-[#ff1e00] pl-6">
        <h1 className="text-4xl pt-10 pb-5">Select the F1 season</h1>
        <section className="flex flex-row gap-4 ">
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-8 py-3 text-center"
            onClick={() => setYear("2022")}
          >
            2022
          </button>
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-8 py-3 text-center"
            onClick={() => setYear("2023")}
          >
            2023
          </button>
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-8 py-3 text-center"
            onClick={() => setYear("2024")}
          >
            2024
          </button>
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-8 py-3 text-center"
            onClick={() => setYear("2025")}
          >
            2025
          </button>
        </section>
        <h2 className="text-4xl pt-10">Select your driver</h2>
        {!loading ? (
          <section className="flex flex-col flex-wrap gap-4 pt-6 items-center justify-center">
            <section className="flex flex-wrap gap-4 pt-6 items-center justify-center">
              {drivers.map((driver) => (
                <DriverCard
                  key={driver.DriverID}
                  driver={driver}
                  decideDriverIcon={decideDriverIcon}
                  decideDriverFlag={decideDriverFlag}
                  selectedDrivers={selectedDrivers}
                  setSelectedDrivers={setSelectedDrivers}
                  year={year}
                />
              ))}
            </section>
            <SelectedDriversList
              selectedDrivers={selectedDrivers}
              setSelectedDrivers={setSelectedDrivers}
              decideDriverFlag={decideDriverFlag}
              decideDriverIcon={decideDriverIcon}
              year={year}
            />
            <DriverScore year={year} selectedDrivers={selectedDrivers} />
          </section>
        ) : (
          <div className="fixed inset-0 flex justify-center items-center flex-col p-1 bg-[#15151e]">
            <img
              src={fmlogo}
              alt="Formula Metric"
              className="w-[10rem] h-auto mb-5 rounded-4xl"
            />
            <h1 className="text-4xl text-[#ff1e00] mb-5">Loading data...</h1>
            <div className="border-2 border-[#80807e] rounded-3xl p-2">
              <BeatLoader
                loading={loading}
                size={120}
                aria-label="Loading Spinner"
                data-testid="loader"
                color="#ff1e00"
                speedMultiplier={4}
              />
              <BeatLoader
                loading={loading}
                size={120}
                aria-label="Loading Spinner"
                data-testid="loader"
                color="#ff1e00"
                speedMultiplier={5}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function DriverCard({
  driver,
  decideDriverIcon,
  decideDriverFlag,
  selectedDrivers,
  setSelectedDrivers,
  year,
}) {
  return (
    <div
      className="w-[350px] h-min bg-[#1e1e1e] rounded-xl text-white flex flex-col justify-between border border-[#e8e8e8] shadow-lg hover:bg-slate-900 shadow-[#ff1e0009]"
      onClick={() => {
        if (selectedDrivers.find((d) => d.DriverID === driver.DriverID)) {
          setSelectedDrivers(
            selectedDrivers.filter((d) => d.DriverID !== driver.DriverID)
          );
        } else if (selectedDrivers.length < 3) {
          setSelectedDrivers([...selectedDrivers, driver]);
        }
      }}
    >
      <div className="flex flex-row justify-between items-center h-fit w-auto">
        {decideDriverIcon(driver, year)}
        <div className="flex flex-col text-end pl-3 pr-3 w-full align-bottom">
          <div className="flex flex-row justify-end items-center gap-1 uppercase text-right">
            {decideDriverFlag(driver, year)}
            <span className="flex gap-1 items-end">
              <span className="text-l pl-2">{driver.FirstName}</span>
              <span className="font-bold text-xl">{driver.LastName}</span>
            </span>
          </div>
          <p className="text-sm text-white/60">{driver.TeamName}</p>
          <div className="text-[#ff1e00] font-bold text-xl">
            {driver.RacingNumber}
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectedDriversList({
  selectedDrivers,
  setSelectedDrivers,
  decideDriverFlag,
  decideDriverIcon,
  year,
}) {
  return (
    <div className="flex flex-col align-center justify-center gap-5 mt-5">
      <h2 className=" text-2xl text-center">Selected Drivers:</h2>
      <div className="flex flex-row gap-5">
        {selectedDrivers.map((driver) => (
          <DriverCard
            key={driver.DriverID}
            driver={driver}
            decideDriverIcon={() => decideDriverIcon(driver, year)}
            decideDriverFlag={decideDriverFlag}
            selectedDrivers={selectedDrivers}
            setSelectedDrivers={setSelectedDrivers}
          />
        ))}
      </div>
    </div>
  );
}

function DriverScore({ year, selectedDrivers }) {
  const [detailedDriver, setDetailedDriver] = useState(null);
  const [resultsA, setResultsA] = useState([]);
  const [resultsB, setResultsB] = useState([]);
  const [resultsC, setResultsC] = useState([]);
  const [driverA, driverB, driverC] = selectedDrivers;

  useEffect(() => {
    if (!driverA || !driverA.DriverID) return;
    fetch(`http://localhost:5000/api/drivers/${year}/${driverA.DriverID}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 API response for driver details:", data);
        if (data && Array.isArray(data.drivers) && data.drivers.length > 0) {
          setDetailedDriver(data?.drivers[0]);
          setResultsA(data.races[`driver${driverA.DriverID}`] || []);
        } else {
          console.error("Driver data is missing from API response");
        }
      })
      .catch((err) => {
        console.error("Error fetching driver details:", err);
      });
    if (driverB?.DriverID) {
      fetch(`http://localhost:5000/api/drivers/${year}/${driverB?.DriverID}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("📦 API response for driver details:", data);
          if (data && Array.isArray(data.drivers) && data.drivers.length > 0) {
            setDetailedDriver(data?.drivers[0]);
            setResultsB(data.races[`driver${driverB?.DriverID}`] || []);
          } else {
            console.error("Driver data is missing from API response");
          }
        })
        .catch((err) => {
          console.error("Error fetching driver details:", err);
        });
    }
    if (driverC?.DriverID) {
      fetch(`http://localhost:5000/api/drivers/${year}/${driverC?.DriverID}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("📦 API response for driver details:", data);
          if (data && Array.isArray(data.drivers) && data.drivers.length > 0) {
            setDetailedDriver(data?.drivers[0]);
            setResultsC(data.races[`driver${driverC?.DriverID}`] || []);
          } else {
            console.error("Driver data is missing from API response");
          }
        })
        .catch((err) => {
          console.error("Error fetching driver details:", err);
        });
    }
  }, [selectedDrivers, year]);

  if (!detailedDriver) {
    return;
  }

  return (
    <div className="flex flex-col my-15 align-center">
      <h2 className="text-4xl text-[#ff1e00] text-center py-10 flex flex-row">
        {selectedDrivers.map((driver) => (
          <span key={driver.DriverID} className="mx-2">
            {driver.FirstName}'s
          </span>
        ))}
        statistics
      </h2>

      <div className="flex flex-col items-center justify-center bg-[#15151e] text-[#ff1e00] p-4 rounded-lg border my-15 mx-5 gap-5">
        <div className="flex flex-row gap-10">
          <LineChart
            className="rounded-xl"
            series={[
              {
                data: resultsA.map((race) => race.Position),
                curve: "linear",
                label: driverA?.LastName,
                color: "#ff1e00",
              },
              {
                data: resultsB.map((race) => race.Position),
                curve: "linear",
                label: driverB?.LastName,
                color: "#0057b8",
              },
              {
                data: resultsC.map((race) => race.Position),
                curve: "linear",
                label: driverC?.LastName,
                color: "#ffd700",
              },
            ]}
            xAxis={[
              {
                data: resultsA.map((race) => race.RoundNo),
                tickNumber: resultsA.length,
                label: "Races",
                labelStyle: {
                  fill: "#ff1e00", // Make axis title visible in red
                  fontWeight: "bold",
                  fontFamily: "Titillium Web, sans-serif",
                  fontSize: 14,
                },
                tickLabelStyle: {
                  fill: "#ffffff", // Make tick numbers visible
                  fontFamily: "Titillium Web, sans-serif",
                  fontSize: 12,
                },
              },
            ]}
            yAxis={[
              {
                reverse: true,
                max: 20,
                min: 1,
                label: "Race Position",
                labelStyle: {
                  fill: "#ff1e00", // Same here
                  fontWeight: "bold",
                  fontFamily: "Titillium Web, sans-serif",
                  fontSize: 14,
                },
                tickLabelStyle: {
                  fill: "#ffffff",
                  fontFamily: "Titillium Web, sans-serif",
                  fontSize: 12,
                },
              },
            ]}
            grid={{ vertical: true, horizontal: true }}
            width={700}
            height={500}
            sx={{
              backgroundColor: "#141418",
              fontFamily: "'Titillium Web', sans-serif",

              // axis labels
              "& .MuiChartsAxis-label": {
                fill: "#ff1e00",
                fontWeight: 600,
              },

              // tick labels (x and y)
              "& .MuiChartsAxis-tickLabel": {
                fill: "#ffffff",
                fontWeight: 400,
              },

              // grid lines
              "& .MuiChartsGrid-line": {
                stroke: "#333333",
                strokeDasharray: "4 4",
              },

              // legend styles
              "& .MuiChartsLegend-root": {
                color: "#ffffff",
                fontFamily: "'Titillium Web', sans-serif",
              },
              "& .MuiChartsLegend-series text": {
                fill: "#ffffff",
                fontWeight: 600,
              },
            }}
            legend={{
              direction: "row",
              position: { vertical: "bottom", horizontal: "middle" },
              itemMarkWidth: 20,
              itemMarkHeight: 10,
              padding: 8,
            }}
          />

          <div className="flex flex-col gap-4">
            <h2 className="text-4xl">{driverA?.FirstName}'s Metrics</h2>
            <div className="flex flex-row gap-2 justify-center items-center mt-1">
              <MetricGauge
                title="Trajectory Score"
                value={driverA?.PTrajectory}
                color="#22c55e"
              />
              <MetricGauge
                title="Absolute Score"
                value={driverA?.PAbsolute}
                color="#eab308"
              />
              <MetricGauge
                title="Consistency Score"
                value={driverA?.PConsistency}
                color="#3b82f6"
              />
              <MetricGauge
                title="Relative Score"
                value={driverA?.PRelative}
                color="#a855f7"
              />
              <MetricGauge
                title="Aggregate Score"
                value={driverA?.PAggregate}
                color="#ef4444"
              />
            </div>
            {driverB ? (
              <>
                <h2 className="text-4xl">{driverB?.FirstName}'s Metrics</h2>
                <div className="flex flex-row gap-2 justify-center items-center mt-1">
                  <MetricGauge
                    title="Trajectory Score"
                    value={driverB?.PTrajectory}
                    color="#22c55e"
                  />
                  <MetricGauge
                    title="Absolute Score"
                    value={driverB?.PAbsolute}
                    color="#eab308"
                  />
                  <MetricGauge
                    title="Consistency Score"
                    value={driverB?.PConsistency}
                    color="#3b82f6"
                  />
                  <MetricGauge
                    title="Relative Score"
                    value={driverB?.PRelative}
                    color="#a855f7"
                  />
                  <MetricGauge
                    title="Aggregate Score"
                    value={driverB?.PAggregate}
                    color="#ef4444"
                  />
                </div>{" "}
              </>
            ) : (
              <></>
            )}
            {driverC ? (
              <>
                <h2 className="text-4xl">{driverC?.FirstName}'s Metrics</h2>
                <div className="flex flex-row gap-2 justify-center items-center mt-1">
                  <MetricGauge
                    title="Trajectory Score"
                    value={driverC?.PTrajectory}
                    color="#22c55e"
                  />
                  <MetricGauge
                    title="Absolute Score"
                    value={driverC?.PAbsolute}
                    color="#eab308"
                  />
                  <MetricGauge
                    title="Consistency Score"
                    value={driverC?.PConsistency}
                    color="#3b82f6"
                  />
                  <MetricGauge
                    title="Relative Score"
                    value={driverC?.PRelative}
                    color="#a855f7"
                  />
                  <MetricGauge
                    title="Aggregate Score"
                    value={driverC?.PAggregate}
                    color="#ef4444"
                  />
                </div>{" "}
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="flex flex-row gap-5">
          <span>
            {resultsA.map((race, index) => (
              <div
                key={index}
                className="flex border border-[#ff1e00] rounded-lg p-1 my-0.5 gap-4 text-white bg-[#1e1e1e]"
              >
                <h3 className="text-xs text-[#ff1e00] font-bold">
                  {race.RoundNo}. {race.Track}
                </h3>
                <p className="text-[10px]">
                  {new Date(race.Date).toLocaleDateString()}
                </p>
                <p className="text-[10px]">Position: {race.Position}</p>
                <p className="text-[10px]">Status: {race.Status}</p>
              </div>
            ))}
          </span>
          <span>
            {resultsB?.map((race, index) => (
              <div
                key={index}
                className="flex border border-[#ff1e00] rounded-lg p-1 my-0.5 gap-4 text-white bg-[#1e1e1e]"
              >
                <h3 className="text-xs text-[#ff1e00] font-bold">
                  {race.RoundNo}. {race.Track}
                </h3>
                <p className="text-[10px]">
                  {new Date(race.Date).toLocaleDateString()}
                </p>
                <p className="text-[10px]">Position: {race.Position}</p>
                <p className="text-[10px]">Status: {race.Status}</p>
              </div>
            ))}
          </span>
          <span>
            {resultsC?.map((race, index) => (
              <div
                key={index}
                className="flex border border-[#ff1e00] rounded-lg p-1 my-0.5 gap-4 text-white bg-[#1e1e1e]"
              >
                <h3 className="text-xs text-[#ff1e00] font-bold">
                  {race.RoundNo}. {race.Track}
                </h3>
                <p className="text-[10px]">
                  {new Date(race.Date).toLocaleDateString()}
                </p>
                <p className="text-[10px]">Position: {race.Position}</p>
                <p className="text-[10px]">Status: {race.Status}</p>
              </div>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

function GaugePointer({ color }) {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();

  if (valueAngle === null) return null;

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };

  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill={color} />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke={color}
        strokeWidth={2}
      />
      <text x={cx} y={cy} textAnchor="middle" dy="0.35em" fill="#ffffff"></text>
    </g>
  );
}
function MetricGauge(props) {
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

export default Drivers;
