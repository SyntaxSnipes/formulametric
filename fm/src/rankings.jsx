import { useEffect, useState, useMemo } from "react";
import fmlogo from "/fmicon.svg";
import BeatLoader from "react-spinners/BeatLoader"; //used for loading screen

//importing components for displaying the Rankings of the Rankings page
import DriverRanking from "./components/DriverRanking";

//importing utility functions and components for the Drivers page
import quickSort from "./utils/quickSort";
import decideDriverFlag from "./utils/decideDriverFlag";
import decideDriverIcon from "./utils/decideDriverIcon";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

//creating Rankings component to display the rankings of drivers for a selected season
function Rankings() {
  const [drivers, setDrivers] = useState([]); //state to hold the driver data fetched from the backend
  const [year, setYear] = useState("2025"); //state to hold the selected year for which the rankings are displayed, default is 2025
  const [loading, setLoading] = useState(true); //state to track whether the data is still loading, used to show a loading screen while fetching data
  const [selectedSortFactor, setSelectedSortFactor] = useState("Pagg"); //state to hold the selected factor by which the drivers will be sorted, default is "Pagg"
  const [sortOrder, setSortOrder] = useState("desc"); //state to hold the selected sort order (asc or desc) for sorting the drivers, default is desc
  //whenever the year changes, load the driver data and store in in drivers state
  useEffect(() => {
    setLoading(true); //set loading to true whenever the year changes or the page is refreshed
    fetch(`${import.meta.env.VITE_API_URL}/api/drivers/${year}`)
      .then((res) => res.json())
      .then((data) => {
        setDrivers(data);
        setLoading(false);
        console.log(data);
      })
      .catch((err) => {
        console.error("Error fetching drivers:", err);
        setLoading(false); //set loading to false even if there's an error
      });
  }, [year]);

  //useMemo to memoize the sorted drivers list so that it only recomputes when the drivers data, selected sort factor, or sort order changes
  const sortedDrivers = useMemo(() => {
    if (!drivers.length) return [];
    return quickSort([...drivers], selectedSortFactor, sortOrder);
  }, [drivers, selectedSortFactor, sortOrder]);

  return (
    <>
      <div className="drivers w-screen text-[#ff1e00] px-4 sm:px-6 mt-4 sm:my-10 mx-auto">
        {/*row of Buttons displaying the Seasons available */}
        <h1 className="text-2xl sm:text-4xl pt-2 sm:pt-10 pb-4 sm:pb-5">
          Select the F1 season
        </h1>
        <section className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-4 mb-6 sm:mb-4 w-full sm:w-auto sm:flex-wrap">
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-4 sm:px-8 py-3 sm:py-3 text-center text-sm sm:text-base flex-1 sm:flex-none min-h-11"
            onClick={() => setYear("2022")}
          >
            2022
          </button>
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-4 sm:px-8 py-3 sm:py-3 text-center text-sm sm:text-base flex-1 sm:flex-none min-h-11"
            onClick={() => setYear("2023")}
          >
            2023
          </button>
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-4 sm:px-8 py-3 sm:py-3 text-center text-sm sm:text-base flex-1 sm:flex-none min-h-11"
            onClick={() => setYear("2024")}
          >
            2024
          </button>
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-4 sm:px-8 py-3 sm:py-3 text-center text-sm sm:text-base flex-1 sm:flex-none min-h-11"
            onClick={() => setYear("2025")}
          >
            2025
          </button>
        </section>

        {/*rows of driver rankings and options to change sorting order*/}
        <div className="flex flex-col lg:flex-row w-full justify-between gap-4 mb-4">
          <h2 className="text-2xl sm:text-4xl">
            {year}&apos;s Drivers Rankings
          </h2>

          {/*Sort order and factor selection UI*/}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 py-auto w-full lg:w-auto">
            <SortOrderBox sortOrder={sortOrder} setSortOrder={setSortOrder} />
            <span className="flex flex-col gap-2 sm:gap-3 my-auto flex-wrap">
              <span className="text-[#ff1e00] text-xs sm:text-base">
                Sort by:
              </span>
              <div className="flex flex-row gap-2 sm:gap-3 items-center text-white flex-wrap">
                {[
                  { label: "Consistency", value: "Pc" },
                  { label: "Trajectory", value: "Pt" },
                  { label: "Absolute", value: "Pa" },
                  { label: "Relative", value: "Pr" },
                  { label: "Aggregate", value: "Pagg" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setSelectedSortFactor(item.value)}
                    className={`px-3 sm:px-3 py-2 sm:py-1 rounded text-xs sm:text-sm transition-all duration-200 min-h-10 sm:min-h-0
                      ${
                        selectedSortFactor === item.value
                          ? "bg-[#ff1e00] text-black"
                          : "bg-[#15151e] border border-[#ff1e00] hover:bg-[#2a2a35]"
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </span>
          </div>
        </div>
        {!loading ? ( //if loading is false, show the sorted driver rankings
          <section className="flex flex-col flex-wrap gap-4 items-center justify-center mt-6 ">
            <section className="flex flex-wrap items-center justify-center m-0 rounded-xl border-[#4F4A4A] bg-[#4F4A4A] border">
              {sortedDrivers.map((driver, index) => (
                <DriverRanking
                  key={driver.DriverID}
                  index={index + 1}
                  driver={driver}
                  decideDriverIcon={decideDriverIcon}
                  decideDriverFlag={decideDriverFlag}
                  year={year}
                  selectedSortFactor={selectedSortFactor}
                />
              ))}
            </section>
          </section>
        ) : (
          //if loading is true, show the loading screen
          <div className="fixed inset-0 flex justify-center items-center flex-col gap-6 bg-[#15151e]">
            <img
              src={fmlogo}
              alt="Formula Metric"
              className="w-[8rem] h-auto rounded-4xl"
            />
            <h1 className="text-3xl text-[#ff1e00]">Loading data...</h1>

            {/*F1 start lights - 5 columns, 2 lights each, illuminate one by one then go dark simultaneously*/}
            <div className="flex flex-row gap-2 bg-[#0a0a0a] px-4 py-4 rounded-lg border-2 border-[#2a2a2a]">
              {[0, 1, 2, 3, 4].map((col) => (
                <div
                  key={col}
                  className="flex flex-col gap-2 bg-[#111] px-2 py-2 rounded"
                >
                  {[0, 1].map((row) => (
                    <div
                      key={row}
                      className="w-10 h-10 rounded-full border-2 border-[#2a2a2a]"
                      style={{
                        animation: `start-light-${col} 3s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            <style>{`
    ${[0, 1, 2, 3, 4]
      .map((col) => {
        const onAt = col * 10;
        const offAt = 70;
        return `
        @keyframes start-light-${col} {
          0%, ${onAt}%                    { background: #1a0000; box-shadow: none; }
          ${onAt + 8}%, ${offAt - 2}%    { background: #ff1e00; box-shadow: 0 0 20px #ff1e00, 0 0 40px #ff1e0088; }
          ${offAt}%, 100%                 { background: #1a0000; box-shadow: none; }
        }
      `;
      })
      .join("")}
  `}</style>
          </div>
        )}
      </div>
    </>
  );
}

//creating SortOrderBox component to display the sort order selection dropdown in the Rankings page
function SortOrderBox({ sortOrder, setSortOrder }) {
  const options = [
    { label: "Best to Worst", value: "desc" },
    { label: "Worst to Best", value: "asc" },
  ];

  return (
    <Autocomplete
      disablePortal
      options={options}
      value={options.find((opt) => opt.value === sortOrder)}
      onChange={(event, newValue) => {
        if (newValue) setSortOrder(newValue.value);
      }}
      sx={{
        width: { xs: "100%", sm: 240 },
        maxWidth: 240,
        "& .MuiOutlinedInput-root": {
          color: "#fff",
          "& fieldset": {
            borderColor: "#ff1e00",
            zIndex: 0,
            fontFamily: "inherit",
          },
          "&:hover fieldset": {
            borderColor: "#ff1e00",
            zIndex: 0,
            fontFamily: "inherit",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#ff1e00",
            zIndex: 0,
            fontFamily: "inherit",
          },
        },
        "& .MuiInputLabel-root": {
          color: "#ff1e00",
          zIndex: 0,
          fontFamily: "inherit",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#ff1e00",
          zIndex: 0,
          fontFamily: "inherit",
        },
        "& .MuiAutocomplete-popupIndicator": {
          color: "#ff1e00",
          zIndex: 0,
          fontFamily: "inherit",
        },
        "& .MuiAutocomplete-clearIndicator": {
          color: "#ff1e00",
          zIndex: 0,
          fontFamily: "inherit",
        },
      }}
      renderInput={(params) => <TextField {...params} label="Order" />}
    />
  );
}

export default Rankings;
