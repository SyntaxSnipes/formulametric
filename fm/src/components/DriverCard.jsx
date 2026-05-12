//creating interactive DriverCard component to display information about a driver, including their name, team, racing number, and country flag, also allows selection of drivers.
export default function DriverCard({
  driver,
  decideDriverIcon,
  decideDriverFlag,
  selectedDrivers,
  setSelectedDrivers,
  year,
}) {
  return (
    //clicking on card will toggle selection of the driver, allowing max 3 drivers to be selected, and applying styling changes to indicate selection
    <div
      className="w-[calc(50%-0.5rem)] sm:w-80 bg-[#1e1e1e] rounded-xl text-white flex flex-row border border-[#e8e8e8] shadow-lg hover:bg-slate-900 shadow-[#ff1e0009] z-0 overflow-hidden"
      onClick={() => {
        if (selectedDrivers.find((d) => d.DriverID === driver.DriverID)) {
          setSelectedDrivers(
            selectedDrivers.filter((d) => d.DriverID !== driver.DriverID),
          );
        } else if (selectedDrivers.length < 3) {
          setSelectedDrivers([...selectedDrivers, driver]);
        }
      }}
    >
      {decideDriverIcon(driver, year, false)} {/*displaying the appropriate driver's portrait*/}

      <div className="flex flex-col text-end pl-2 sm:pl-3 pr-2 sm:pr-3 w-full justify-end py-2 sm:py-3">
        <div className="flex flex-row justify-end items-center gap-1 uppercase text-right">
          <span className="hidden sm:block">{decideDriverFlag(driver, year)}</span> {/*displaying the appropriate driver's flag*/}

          {/*displaying the appropriate driver's full name - stacked on mobile, inline on sm+*/}
          <span className="flex flex-col sm:flex-row gap-0 sm:gap-1 items-end sm:items-baseline">
            <span className="font-bold text-lg sm:text-xl sm:order-2 leading-tight">{driver.LastName}</span>
            <span className="text-xs sm:text-l sm:order-1 sm:pl-2 leading-tight">{driver.FirstName}</span>
          </span>
        </div>
        {/*displaying the appropriate driver's team name and racing number*/}
        <p className="text-[10px] sm:text-sm text-white/60 leading-tight">{driver.TeamName}</p>
        <div className="text-[#ff1e00] font-bold text-sm sm:text-xl leading-none">
          {driver.RacingNumber}
        </div>
      </div>
    </div>
  );
}