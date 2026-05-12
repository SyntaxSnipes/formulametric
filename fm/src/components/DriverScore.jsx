import { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import DriverMetrics from "./DriverMetrics";
import DriverResultsList from "./DriverResultsList";

async function fetchDriverData(year, driverID) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/drivers/${year}/${driverID}`,
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
  //creating state variables to store the results for the 3 selected drivers
  const [resultsA, setResultsA] = useState([]);
  const [resultsB, setResultsB] = useState([]);
  const [resultsC, setResultsC] = useState([]);

  //creating state for the chart container node and width, used for responsive sizing
  const [chartContainerNode, setChartContainerNode] = useState(null);
  const [chartWidth, setChartWidth] = useState(500);

  //whenever the chart container node changes, read its width and set up a ResizeObserver to update the width whenever the container resizes
  useEffect(() => {
    if (!chartContainerNode) return;
    //read the width immediately on mount
    setChartWidth(chartContainerNode.clientWidth);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setChartWidth(entry.contentRect.width);
      }
    });
    observer.observe(chartContainerNode);
    return () => observer.disconnect();
  }, [chartContainerNode]); //re-runs when the node actually appears

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

  //computing the max number of races across all selected drivers, used for the x-axis of the line chart
  const maxRaces = Math.max(
    racesA?.length || 0,
    racesB?.length || 0,
    racesC?.length || 0,
  );

  //checking if there are any selected drivers to display
  const hasDrivers = selectedDrivers && selectedDrivers.length > 0;

  //shared props for both mobile and desktop line charts
  const sharedProps = {
    series: [
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
    ],
    xAxis: [
      {
        data: Array.from({ length: maxRaces }, (_, i) => i + 1),
        tickNumber: maxRaces,
        label: chartWidth < 500 ? "" : "Races",
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
    ],
    yAxis: [
      {
        reverse: true,
        max:
          Math.max(
            ...racesA.map((r) => r?.Position ?? 0),
            ...racesB.map((r) => r?.Position ?? 0),
            ...racesC.map((r) => r?.Position ?? 0),
          ) + 1,
        min: 1,
        label: chartWidth < 500 ? "" : "Race Position",
        labelStyle: {
          fill: "#ff1e00",
          fontWeight: 600,
          fontSize: 10,
        },
        tickLabelStyle: {
          fill: "#ffffff",
          fontFamily: "Titillium Web, sans-serif",
          fontSize: 9,
        },
      },
    ],
    grid: { vertical: true, horizontal: true },
    width: chartWidth,
    height: chartWidth < 500 ? 250 : 450,
    sx: {
      backgroundColor: "#141418",
      fontFamily: "'Titillium Web', sans-serif",
      padding: 0,
      margin: 0,
      // axis labels
      "& .MuiChartsAxis-label": {
        fill: "#ff1e00",
        fontWeight: 600,
        fontSize: 12,
      },
      // tick labels
      "& .MuiChartsAxis-tickLabel": {
        fill: "#ffffff",
        fontWeight: 400,
        fontSize: 10,
      },
      // grid lines
      "& .MuiChartsGrid-line": { stroke: "#333333", strokeDasharray: "4 4" },
      // legend styles
      "& .MuiChartsLegend-root": {
        color: "#ffffff",
        fontFamily: "'Titillium Web', sans-serif",
      },
      "& .MuiChartsLegend-series text": { fill: "#ffffff", fontWeight: 600 },
    },
    slotProps: { legend: { hidden: false } },
    legend: {
      direction: "row",
      position: { vertical: "bottom", horizontal: "middle" },
      itemMarkWidth: 20,
      itemMarkHeight: 10,
      padding: 8,
    },
  };

  return (
    //main container for the DriverScore component, always mounted so the chart container ref is always available
    <div className="flex flex-col my-4 sm:my-15 align-center z-1">
      {hasDrivers && (
        <>
          {/*Displays the names of the selected drivers*/}
          <h2 className="text-2xl sm:text-4xl text-[#ff1e00] text-center py-6 sm:py-10">
            Statistics for drivers: {driverA?.FirstName} {driverA?.LastName}
            {driverB ? `, ${driverB.FirstName} ${driverB.LastName}` : ""}
            {driverC ? `, ${driverC.FirstName} ${driverC.LastName}` : ""}
          </h2>

          {/*Container for the line chart and metrics display*/}
          <div className="flex flex-col lg:flex-row gap-5 items-center w-full">
            {/*Line chart to display the race positions for the selected drivers across the season*/}
            <div
              className="w-full lg:flex-[3] overflow-hidden"
              ref={setChartContainerNode}
            >
              {chartWidth < 500 ? (
                <LineChart
                  {...sharedProps}
                  leftAxis={null}
                  width={chartWidth + 30}
                  margin={{ top: 5, bottom: 5, left: 0, right: 20 }}
                  sx={{
                    ...sharedProps.sx,
                    marginLeft: "-25px",
                  }}
                />
              ) : (
                <LineChart
                  {...sharedProps}
                  margin={{ top: 5, bottom: 30, left: 30, right: 5 }}
                />
              )}
            </div>

            {/*Display of the performance metrics for the selected drivers using MetricGauge components, with conditional rendering based on the number of selected drivers*/}
            <div className="flex flex-col gap-4 w-full lg:flex-[2]">
              <DriverMetrics driver={driverA} />
              {driverB ? <DriverMetrics driver={driverB} /> : <></>}
              {driverC ? <DriverMetrics driver={driverC} /> : <></>}
            </div>
          </div>

          {/*Displaying the race results for the selected drivers in a list format, with conditional rendering based on the number of selected drivers*/}
          <div className="flex flex-col gap-4 my-4 w-full">
            <DriverResultsList
              results={resultsA}
              driverName={driverA?.LastName}
            />
            {driverB ? (
              <DriverResultsList
                results={resultsB}
                driverName={driverB?.LastName}
              />
            ) : (
              <></>
            )}
            {driverC ? (
              <DriverResultsList
                results={resultsC}
                driverName={driverC?.LastName}
              />
            ) : (
              <></>
            )}
          </div>
        </>
      )}
    </div>
  );
}
