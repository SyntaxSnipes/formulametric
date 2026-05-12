import { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import DriverMetrics from "./DriverMetrics";
import DriverResultsList from "./DriverResultsList";

async function fetchDriverData(year, driverID) {
  const res = await fetch(
    `http://localhost:5000/api/drivers/${year}/${driverID}`,
  ); //fetch request to backend for driver
  const data = await res.json();
  console.log("API response for driver details:", data);
  if (data && Array.isArray(data.drivers) && data.drivers.length > 0) {
    const racesData = Array(data.races[`driver${driverID}`][0].NoRounds).fill(
      null,
    ); //initializing an array to store the race results for driver, with length equal to the number of rounds in the season, filled with null values

    //looping through the fetched race results for driver A and populating the racesData array with the position for each round, using the round number as the index
    for (const race of data.races[`driver${driverID}`]) {
      racesData[race.RoundNo - 1] = {
        RoundNo: race.RoundNo,
        Position: race?.Position ?? null,
      };
    }
    return [data, racesData];
  } else {
    console.error("Driver data is missing from API response");
  }
}

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
    const fetchData = async () => {
      if (!driverA || !driverA.DriverID) return; //if there's no driverA, return nothing and skip the fetch requests
      const [dataA, racesDataA] = await fetchDriverData(year, driverA.DriverID); //fetching the race results for driver A using the fetchDriverData function
      setResultsA(dataA.races[`driver${driverA.DriverID}`] || []); //setting the results state for driver to the fetched data, empty array if no data found
      console.log(dataA.races[`driver${driverA.DriverID}`]);
      setRacesA(racesDataA);
      if (driverB && driverB.DriverID) {
        const [dataB, racesDataB] = await fetchDriverData(
          year,
          driverB.DriverID,
        ); //fetching the race results for driver B using the fetchDriverData function
        setResultsB(dataB.races[`driver${driverB.DriverID}`] || []); //setting the results state for driver to the fetched data, empty array if no data found
        console.log(dataB.races[`driver${driverB.DriverID}`]);
        setRacesB(racesDataB);
      }
      if (driverC && driverC.DriverID) {
        const [dataC, racesDataC] = await fetchDriverData(
          year,
          driverC.DriverID,
        ); //fetching the race results for driver C using the fetchDriverData function
        setResultsC(dataC.races[`driver${driverC.DriverID}`] || []); //setting the results state for driver to the fetched data, empty array if no data found
        console.log(dataC.races[`driver${driverC.DriverID}`]);
        setRacesC(racesDataC);
      }
    };
    fetchData();
  }, [selectedDrivers, year]);

  if (!selectedDrivers || selectedDrivers.length === 0) return;

  return (
    //main container for the DriverScore component
    <div className="flex flex-col my-15 align-center z-1">
      {/*Displays the first name of the selected drivers*/}
      <h2 className="text-4xl text-[#ff1e00] text-center py-10 flex flex-row">
        Statistics for drivers: 
        {driverA ? ` ${driverA.FirstName} ${driverA.LastName},` : ""} {driverB ? `${driverB.FirstName} ${driverB.LastName},` : ""} {driverC ? `${driverC.FirstName} ${driverC.LastName}` : ""}
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
            <DriverMetrics driver={driverA} />
            {driverB ? <DriverMetrics driver={driverB} /> : <></>}
            {driverC ? <DriverMetrics driver={driverC} /> : <></>}
          </div>
        </div>

        {/*Displaying the race results for the selected drivers in a list format, with conditional rendering based on the number of selected drivers*/}
        <div className="flex flex-row gap-5">
            <DriverResultsList results={resultsA} />
            {driverB ? <DriverResultsList results={resultsB} /> : <></>}
            {driverC ? <DriverResultsList results={resultsC} /> : <></>}
        </div>
      </div>
    </div>
  );
}
