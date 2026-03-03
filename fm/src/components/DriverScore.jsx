import { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import MetricGauge from "../components/Gauge/MetricGuage";

//creating DriverScore component to display the performance metrics alongside a line chart of results and a list of race results for the selected drivers in a given year
export default function DriverScore({ year, selectedDrivers }) {
  const [resultsA, setResultsA] = useState([]);
  const [resultsB, setResultsB] = useState([]);
  const [resultsC, setResultsC] = useState([]);
  const [totalRaces, setTotalRaces] = useState(0);
  const [driverA, driverB, driverC] = selectedDrivers;

  const [racesA, setRacesA] = useState([]);
  const [racesB, setRacesB] = useState([]);
  const [racesC, setRacesC] = useState([]);

  useEffect(() => {
    setResultsA([]);
    setResultsB([]);
    setResultsC([]);
  }, [selectedDrivers, year]);

  useEffect(() => {
    if (!driverA || !driverA.DriverID) return;
    fetch(`http://localhost:5000/api/drivers/${year}/${driverA.DriverID}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("API response for driver details:", data);
        if (data && Array.isArray(data.drivers) && data.drivers.length > 0) {
          setResultsA(data.races[`driver${driverA.DriverID}`] || []);
          setTotalRaces(data.races[`driver${driverA.DriverID}`][0].NoRounds);
          console.log(data.races[`driver${driverA.DriverID}`]);

          const racesData = Array(
            data.races[`driver${driverA.DriverID}`][0].NoRounds,
          ).fill(null);

          for (const race of data.races[`driver${driverA.DriverID}`]) {
            racesData[race.RoundNo - 1] = {
              RoundNo: race.RoundNo,
              Position: race?.Position ?? null,
            };
          }
          setRacesA(racesData);
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
          console.log("API response for driver details:", data);
          if (data && Array.isArray(data.drivers) && data.drivers.length > 0) {
            setResultsB(data.races[`driver${driverB.DriverID}`] || []);
            const racesData = Array(
              data.races[`driver${driverB?.DriverID}`][0].NoRounds,
            ).fill(null);

            for (const race of data.races[`driver${driverB?.DriverID}`]) {  
              racesData[race.RoundNo - 1] = {
                RoundNo: race.RoundNo,
                Position: race?.Position ?? null,
              };
            }
            setRacesB(racesData);
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
          console.log("API response for driver details:", data);
          if (data && Array.isArray(data.drivers) && data.drivers.length > 0) {
            setResultsC(data.races[`driver${driverC?.DriverID}`] || []);
            const racesData = Array(
              data.races[`driver${driverC?.DriverID}`][0].NoRounds,
            ).fill(null);
            for (const race of data.races[`driver${driverC?.DriverID}`]) {  
              racesData[race.RoundNo - 1] = {
                RoundNo: race.RoundNo,
                Position: race?.Position ?? null,
              };
            }
            setRacesC(racesData);
          } else {
            console.error("Driver data is missing from API response");
          }
        })
        .catch((err) => {
          console.error("Error fetching driver details:", err);
        });
    }
  }, [selectedDrivers, year]);

  if (!selectedDrivers || selectedDrivers.length === 0) {
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
                data: racesA.map((race) => race?.Position ?? null),
                curve: "linear",
                label: driverA?.LastName,
                color: "#ff1e00",
              },
              {
                data: racesB.map((race) => race?.Position ?? null),
                curve: "linear",
                label: driverB?.LastName,
                color: "#0057b8",
              },
              {
                data: racesC.map((race) => race?.Position ?? null),
                curve: "linear",
                label: driverC?.LastName,
                color: "#ffd700",
              },
            ]}
            xAxis={[
              {
                data: Array.from(
                  {
                    length: Math.max(
                      racesA?.length,
                      racesB?.length,
                      racesC?.length,
                    ),
                  },
                  (_, i) => i + 1,
                ),
                tickNumber: Math.max(
                  racesA?.length,
                  racesB?.length,
                  racesC?.length,
                ),
                label: "Races",
                labelStyle: {
                  fill: "#ff1e00", // Make axis title visible in red
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
            yAxis={[
              {
                reverse: true,
                max: 20,
                min: 1,
                label: "Race Position",
                labelStyle: {
                  fill: "#ff1e00",
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
