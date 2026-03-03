import DriverCard from "./DriverCard";
export default function SelectedDriversList({
  selectedDrivers,
  setSelectedDrivers,
  decideDriverFlag,
  decideDriverIcon,
  year,
}) {
  return (
    <div className="flex flex-col align-center justify-center gap-5 mt-5">
      <h2 className=" text-2xl text-center">Selected Drivers:</h2>
      <div className="flex flex-row gap-5">
        {selectedDrivers.map((driver) => (
          <DriverCard
            key={driver.DriverID}
            driver={driver}
            decideDriverIcon={() => decideDriverIcon(driver, year, false)}
            decideDriverFlag={decideDriverFlag}
            selectedDrivers={selectedDrivers}
            setSelectedDrivers={setSelectedDrivers}
          />
        ))}
      </div>
    </div>
  );
}