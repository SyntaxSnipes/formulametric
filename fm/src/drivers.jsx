import { useEffect, useState } from "react";
import fmlogo from "/fmicon.svg";

//importing utility functions and components for the Drivers page
import decideDriverFlag from "./utils/decideDriverFlag"; //page xx
import decideDriverIcon from "./utils/decideDriverIcon"; //page xx

//importing components for displaying selected drivers and their scores
import SelectedDriversList from "./components/SelectedDriversList"; //page xx
import DriverScore from "./components/DriverScore"; //page xx
import DriverCard from "./components/DriverCard"; //page xx

//creating Drivers component to display the driver selection page, allowing users to select a season and choose drivers to compare based on their performance metrics
function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [year, setYear] = useState("2025");
  const [loading, setLoading] = useState(true);
  //whenever the year changes, set the selectedDrivers list to empty array
  useEffect(() => {
    setSelectedDrivers([]);
  }, [year]);

  //whenever the year changes, load the driver data and store in in state
  useEffect(() => {
    setLoading(true); //set loading to true whenever the year changes or the page is refreshed
    fetch(`${import.meta.env.VITE_API_URL}/api/drivers/${year}`) //fetching driver data for the selected year from the backend
      .then((res) => res.json())
      .then((data) => {
        setDrivers(data); //set fetched data into drivers state
        setLoading(false); //set loading to false after data is fetched
      })
      .catch((err) => {
        console.error("Error fetching drivers:", err);
        setLoading(false); //set loading to false even if there's an error
      });
  }, [year]);

  //state to keep track of the selected drivers for comparison, max 3 drivers.
  const [selectedDrivers, setSelectedDrivers] = useState([]);

  return (
    <>
      <div className="drivers w-screen text-[#ff1e00] px-4 sm:px-6 pt-2 sm:pt-0">
        {/*row of Buttons displaying the Seasons available */}
        <h1 className="text-2xl sm:text-4xl pt-4 sm:pt-10 pb-4 sm:pb-5">
          Select the F1 season
        </h1>
        <section className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-4 flex-wrap">
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-4 sm:px-8 py-3 sm:py-3 text-center text-sm sm:text-base flex-1 sm:flex-none min-h-11"
            onClick={() => setYear("2022")} //set the year state to 2022
          >
            2022
          </button>
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-4 sm:px-8 py-3 sm:py-3 text-center text-sm sm:text-base flex-1 sm:flex-none min-h-11"
            onClick={() => setYear("2023")} //set the year state to 2023
          >
            2023
          </button>
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-4 sm:px-8 py-3 sm:py-3 text-center text-sm sm:text-base flex-1 sm:flex-none min-h-11"
            onClick={() => setYear("2024")} //set the year state to 2024
          >
            2024
          </button>
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-4 sm:px-8 py-3 sm:py-3 text-center text-sm sm:text-base flex-1 sm:flex-none min-h-11"
            onClick={() => setYear("2025")} //set the year state to 2025
          >
            2025
          </button>
        </section>

        {/*rows of DriverCards of drivers that participated in the selected season*/}
        <h2 className="text-2xl sm:text-4xl pt-6 sm:pt-10">
          Select your driver
        </h2>
        {!loading ? ( // show the driver selection interface if loading is false
          <section className="flex flex-col gap-4 pt-6 w-full">
            <section className="flex flex-wrap gap-2 sm:gap-4 pt-0 sm:pt-6 items-stretch justify-center w-full">
              {/*mapping through the drivers and rendering a DriverCard for each, passing necessary props for displaying driver info and handling selection*/}
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
            {/*displaying the list of selected drivers and the DriverScore component for comparing the selected drivers based on their performance metrics*/}
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
          //show a loading screen is isLoading is true
          <div className="fixed inset-0 flex justify-center items-center flex-col gap-6 bg-[#15151e]">
            <img
              src={fmlogo}
              alt="Formula Metric"
              className="w-[8rem] h-auto rounded-4xl"
            />
            <h1 className="text-3xl text-[#ff1e00]">Loading data...</h1>

            {/*F1 start lights - 5 columns, 2 lights each, illuminate column by column*/}
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
                        animation: `start-light 2.5s ease-in-out infinite`,
                        animationDelay: `${col * 0.4}s`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            <style>{`
    @keyframes start-light {
      0%        { background: #1a0000; box-shadow: none; }
      20%       { background: #ff1e00; box-shadow: 0 0 20px #ff1e00, 0 0 40px #ff1e0088; }
      70%       { background: #ff1e00; box-shadow: 0 0 20px #ff1e00, 0 0 40px #ff1e0088; }
      85%, 100% { background: #1a0000; box-shadow: none; }
    }
  `}</style>
          </div>
        )}
      </div>
    </>
  );
}

export default Drivers;
