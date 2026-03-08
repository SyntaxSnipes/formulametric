import { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import MetricGauge from "./Gauge/MetricGauge";
import process from "process";

//creating DriverScore component to display the performance metrics alongside a line chart of results and a list of race results for the selected drivers in a given year
export default function DriverScore({ year, selectedDrivers }) {

  //creating state variables to store the results for the 3 seleced drivers
  const [resultsA, setResultsA] = useState([]);
  const [resultsB, setResultsB] = useState([]);
  const [resultsC, setResultsC] = useState([]);

  //destructuring the selected drivers for easier access
  const [driverA, driverB, driverC] = selectedDrivers;

  //creating state variables to store the race results for the 3 selected drivers
  const [racesA, setRacesA] = useState([]);
  const [racesB, setRacesB] = useState([]);
  const [racesC, setRacesC] = useState([]);

  //resetting the results state variables whenever the selectedDrivers or year changes
  useEffect(() => {
    //setting the results state to empty arrays
    setResultsA([]);
    setResultsB([]);
    setResultsC([]);

    setRacesA([]);
    setRacesB([]);
    setRacesC([]);
  }, [selectedDrivers, year]);

  //fetching the race results for the selected drivers whenever the selectedDrivers or year changes, and storing the results in the appropriate state variables
  useEffect(() => {
    if (!driverA || !driverA.DriverID) return; //if there's no driverA, return nothing and skip the fetch requests
      setResultsA([]);
      setResultsB([]);
      setResultsC([]);
    fetch(`http://${process.env.BACKEND_URL}/api/drivers/${year}/${driverA.DriverID}`) //fetch request to backend for driverA
      .then((res) => res.json())
      .then((data) => {
        console.log("API response for driver details:", data);
        if (data && Array.isArray(data.drivers) && data.drivers.length > 0) {
          setResultsA(data.races[`driver${driverA.DriverID}`] || []); //setting the results state for driverA to the fetched data, empty array if no data found
          console.log(data.races[`driver${driverA.DriverID}`]);

          const racesData = Array(
            data.races[`driver${driverA.DriverID}`][0].NoRounds,
          ).fill(null); //initializing an array to store the race results for driverA, with length equal to the number of rounds in the season, filled with null values

          // looping through the fetched race results for driver A and populating the racesData array with the position for each round, using the round number as the index
          for (const race of data.races[`driver${driverA.DriverID}`]) {
            racesData[race.RoundNo - 1] = {
              RoundNo: race.RoundNo,
              Position: race?.Position ?? null,
            };
          }
          setRacesA(racesData); //setting the races state for driverA to the populated racesData array which contains the position for each round, null if no data found for that round
        } else {
          console.error("Driver data is missing from API response");
        }
      })
      .catch((err) => {
        console.error("Error fetching driver details:", err);
      });

    //check if there's a selected second driver
    if (driverB?.DriverID) {
      fetch(`http://${process.env.BACKEND_URL}/api/drivers/${year}/${driverB?.DriverID}`) //fetch request to backend for driverB, if exists
        .then((res) => res.json())
        .then((data) => {
          console.log("API response for driver details:", data);
          if (data && Array.isArray(data.drivers) && data.drivers.length > 0) {
            setResultsB(data.races[`driver${driverB.DriverID}`] || []); //setting the results state for driverB, if exists, to the fetched data, empty array if no data found

            const racesData = Array(
              data.races[`driver${driverB?.DriverID}`][0].NoRounds,
            ).fill(null); //initializing an array to store the race results for driverB, if exists, with length equal to the number of rounds in the season, filled with null values
            
            //looping through the fetched race results for driverB, if exists, and populating the racesData array with the position for each round, using the round number as the index
            for (const race of data.races[`driver${driverB?.DriverID}`]) {  
              racesData[race.RoundNo - 1] = {
                RoundNo: race.RoundNo,
                Position: race?.Position ?? null,
              };
            }
            setRacesB(racesData); //setting the races state for driverB, if exists, to the populated racesData array which contains the position for each round, null if no data found for that round
          } else {
            console.error("Driver data is missing from API response");
          }
        })
        .catch((err) => {
          console.error("Error fetching driver details:", err);
        });
    }

    //check if there's a selected third driver
    if (driverC?.DriverID) {
      fetch(`http://${process.env.BACKEND_URL}/api/drivers/${year}/${driverC?.DriverID}`) //fetch request to backend for driverC, if exists
        .then((res) => res.json())
        .then((data) => {
          console.log("API response for driver details:", data);
          if (data && Array.isArray(data.drivers) && data.drivers.length > 0) {
            setResultsC(data.races[`driver${driverC?.DriverID}`] || []); //setting the results state for driverC, if exists, to the fetched data, empty array if no data found

            const racesData = Array(
              data.races[`driver${driverC?.DriverID}`][0].NoRounds,
            ).fill(null); //initializing an array to store the race results for driverC, if exists, with length equal to the number of rounds in the season, filled with null values

            //looping through the fetched race results for driverC, if exists, and populating the racesData array with the position for each round, using the round number as the index
            for (const race of data.races[`driver${driverC?.DriverID}`]) {  
              racesData[race.RoundNo - 1] = {
                RoundNo: race.RoundNo,
                Position: race?.Position ?? null,
              };
            }
            setRacesC(racesData); //setting the races state for driverC, if exists, to the populated racesData array which contains the position for each round, null if no data found for that round
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
    //main container for the DriverScore component
    <div className="flex flex-col my-15 align-center z-1">

      {/*Displays the first name of the selected drivers*/}
      <h2 className="text-4xl text-[#ff1e00] text-center py-10 flex flex-row">
        Statistics for drivers: 
        {selectedDrivers.map((driver) => (
          <span key={driver.DriverID} className="mx-2">
            {driver.FirstName}
          </span>
        ))}
      </h2>
      
      {/*Container for the line chart and metrics display*/}
      <div className="flex flex-col items-center justify-center bg-[#15151e] text-[#ff1e00] p-4 rounded-lg border my-15 mx-5 gap-5">
        <div className="flex flex-row gap-10">
          {/*Line chart to display the race positions for the selected drivers across the season*/}
          <LineChart
            className="rounded-xl"
            series={[
              {
                data: racesA.map((race) => race?.Position ?? null), //mapping the racesA data to extract the position for each round, using null if no data found for that round
                curve: "linear",
                label: driverA?.LastName,
                color: "#ff1e00",
              },
              {
                data: racesB.map((race) => race?.Position ?? null), //mapping the racesB data to extract the position for each round, using null if no data found for that round
                curve: "linear",
                label: driverB?.LastName,
                color: "#0057b8",
              },
              {
                data: racesC.map((race) => race?.Position ?? null), //mapping the racesC data to extract the position for each round, using null if no data found for that round
                curve: "linear",
                label: driverC?.LastName,
                color: "#ffd700",
              },
            ]}
            // configuring the x and y axes for the line chart
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
          {/*Display of the performance metrics for the selected drivers using MetricGauge components, with conditional rendering based on the number of selected drivers*/}
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

        {/*Displaying the race results for the selected drivers in a list format, with conditional rendering based on the number of selected drivers*/}
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
