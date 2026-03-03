import { useEffect, useState, useMemo } from "react";
import fmlogo from "/fmicon.png";
import BeatLoader from "react-spinners/BeatLoader";

import decideDriverFlag from "./utils/decideDriverFlag";
import decideDriverIcon from "./utils/decideDriverIcon";

import DriverRanking from "./components/DriverRanking";
import quickSort from "./utils/quickSort";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

function Rankings() {
  const [drivers, setDrivers] = useState([]);
  const [year, setYear] = useState("2022");
  const [loading, setLoading] = useState(true);
  const [selectedSortFactor, setSelectedSortFactor] = useState("Pagg");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    setLoading(true); // Set loading to true whenever the year changes or the page is refreshed
    fetch(`http://localhost:5000/api/drivers/${year}`)
      .then((res) => res.json())
      .then((data) => {
        setDrivers(data);
        setLoading(false);
        console.log(data);
      })
      .catch((err) => {
        console.error("Error fetching drivers:", err);
        setLoading(false); // Set loading to false even if there's an error
      });
  }, [year]);

  const sortedDrivers = useMemo(() => {
    if (!drivers.length) return [];
    return quickSort([...drivers], selectedSortFactor, sortOrder);
  }, [drivers, selectedSortFactor, sortOrder]);

  return (
    <>
      <div className="drivers w-screen text-[#ff1e00] px-6 my-10 my-auto mx-auto">
        <h1 className="text-4xl pt-10 pb-5">Select the F1 season</h1>
        <section className="flex flex-row gap-4 mb-4">
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
        <div className="flex flex-row w-full justify-between">
          <h2 className="text-4xl">{year}&apos;s Drivers Rankings</h2>
          <div className="flex flex-row gap-6 py-auto">
            <SortOrderBox sortOrder={sortOrder} setSortOrder={setSortOrder} />
            <span className="flex flex-row gap-3 my-auto">
                        <div className="flex gap-3 items-center text-white">
            <span className="text-[#ff1e00]">Sort by:</span>
            {[
              { label: "Pc", value: "Pc" },
              { label: "Pt", value: "Pt" },
              { label: "Pa", value: "Pa" },
              { label: "Pr", value: "Pr" },
              { label: "Pagg", value: "Pagg" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setSelectedSortFactor(item.value)}
                className={`px-3 py-1 rounded transition-all duration-200
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
        {!loading ? (
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
          <div className="fixed inset-0 flex justify-center items-center flex-col p-1 bg-[#15151e]">
            <img
              src={fmlogo}
              alt="Formula Metric"
              className="w-[10rem] h-auto mb-5 rounded-4xl"
            />
            <h1 className="text-4xl text-[#ff1e00] mb-5">Loading data...</h1>
            <div className="border-2 border-[#80807e] rounded-3xl p-2 z-999">
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
        width: 240,
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
