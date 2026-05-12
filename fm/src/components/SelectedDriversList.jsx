import DriverCard from "./DriverCard";

//creating SelectedDriversList component to display the list of selected drivers
export default function SelectedDriversList({
  selectedDrivers,
  setSelectedDrivers,
  decideDriverFlag,
  decideDriverIcon,
  year,
}) {
  return (
    <div className="flex flex-col gap-5 w-full">
      <h2 className=" text-2xl text-center">Selected Drivers:</h2>
      <div className="flex flex-wrap gap-2 sm:gap-4 w-full justify-center">
        {/*mapping through the selected drivers and rendering a DriverCard for each, passing necessary props for displaying driver info*/}
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