import { useEffect, useState } from "react";
import fmlogo from "/fmicon.png";
import BeatLoader from "react-spinners/BeatLoader"; //used for loading screen

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
  const [year, setYear] = useState("2024");
  const [loading, setLoading] = useState(true);

  //whenever the year changes, set the selectedDrivers list to empty array
  useEffect(() => {
    setSelectedDrivers([]);
  }, [year]);

  //whenever the year changes, load the driver data and store in in state
  useEffect(() => {
    setLoading(true); //set loading to true whenever the year changes or the page is refreshed
    fetch(`http://localhost:5000/api/drivers/${year}`) //fetching driver data for the selected year from the backend
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
      <div className="drivers w-screen text-[#ff1e00] pl-6">

        {/*row of Buttons displaying the Seasons available */}
        <h1 className="text-4xl pt-10 pb-5">Select the F1 season</h1>
        <section className="flex flex-row gap-4 ">
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-8 py-3 text-center"
            onClick={() => setYear("2022")} //set the year state to 2022
          >
            2022
          </button>
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-8 py-3 text-center"
            onClick={() => setYear("2023")} //set the year state to 2023
          >
            2023
          </button>
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-8 py-3 text-center"
            onClick={() => setYear("2024")} //set the year state to 2024
          >
            2024
          </button>
          <button
            className="bg-[#15151e] text-autotext-white border border-[#ff1e00] rounded-lg px-8 py-3 text-center"
            onClick={() => setYear("2025")} //set the year state to 2025
          >
            2025
          </button>
        </section>

        {/*rows of DriverCards of drivers that participated in the selected season*/}
        <h2 className="text-4xl pt-10">Select your driver</h2>
        {!loading ? ( // show the driver selection interface if loading is false
          <section className="flex flex-col flex-wrap gap-4 pt-6 items-center justify-center">
            <section className="flex flex-wrap gap-4 pt-6 items-center justify-center">
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
        ) : ( //show a loading screen is isLoading is true
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
