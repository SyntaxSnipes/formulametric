import { useEffect, useState } from "react";
import fmlogo from "/fmicon.svg";
import BeatLoader from "react-spinners/BeatLoader"; //used for loading screen

import decideDriverFlag from "../utils/decideDriverFlag";
import decideDriverIcon from "../utils/decideDriverIcon";
import DriverPodiumCard from "./DriverPodiumCard";

//creating DriverPodium component to display the podium of drivers for a selected season
function DriverPodium() {
  const [drivers, setDrivers] = useState([]); //state to hold the driver data fetched from the backend
  const [loading, setLoading] = useState(true); //state to track whether the data is still loading, used to show a loading screen while fetching data

  //whenever the year changes, load the driver data and store in in drivers state
  useEffect(() => {
    setLoading(true); //set loading to true whenever the year changes or the page is refreshed
    fetch(`http://localhost:5000/api/drivers/2025/top3`)
      .then((res) => res.json())
      .then((data) => {
        setDrivers(data);
        console.log(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching drivers:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col justify-center gap-5 mt-5">
      {!loading ? (
        <>
          <h2 className="text-2xl text-center">FormulaMetric's 2025 Podium</h2>
          <div className="flex flex-row gap-5 items-end max-w-6xl w-full mx-auto">
            <DriverPodiumCard
              key={drivers[1].DriverID}
              driver={drivers[1]}
              index={2}
              decideDriverIcon={() => decideDriverIcon(drivers[1], 2025, false)}
              decideDriverFlag={decideDriverFlag}
              year={2025}
            />
            <DriverPodiumCard
              key={drivers[0].DriverID}
              driver={drivers[0]}
              index={1}
              decideDriverIcon={() => decideDriverIcon(drivers[0], 2025, false)}
              decideDriverFlag={decideDriverFlag}
              year={2025}
            />
            <DriverPodiumCard
              key={drivers[2].DriverID}
              driver={drivers[2]}
              index={3}
              decideDriverIcon={() => decideDriverIcon(drivers[2], 2025, false)}
              decideDriverFlag={decideDriverFlag}
              year={2025}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <BeatLoader color="#ff1e00" size={15} />
          <span className="text-white">Loading top drivers...</span>
        </div>
      )}
    </div>
  );
}

export default DriverPodium;
