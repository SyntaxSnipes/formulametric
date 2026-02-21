import { useEffect, useState } from "react";
import fmlogo from "/fmicon.png";
import BeatLoader from "react-spinners/BeatLoader";

import decideDriverFlag from "./utils/decideDriverFlag";
import decideDriverIcon from "./utils/decideDriverIcon";
import normalizeName from "./utils/normalizeName";

import SelectedDriversList from "./components/SelectedDriversList";
import DriverScore from "./components/DriverScore";
import DriverCard from "./components/DriverCard";


function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [year, setYear] = useState("2022");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedDrivers([]);
  }, [year]);

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

export default Drivers;
