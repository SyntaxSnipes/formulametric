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
      className="w-[350px] h-min bg-[#1e1e1e] rounded-xl text-white flex flex-col justify-between border border-[#e8e8e8] shadow-lg hover:bg-slate-900 shadow-[#ff1e0009] z-0"
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
      <div className="flex flex-row justify-between items-center h-fit w-auto">
        {decideDriverIcon(driver, year, false)} {/*displaying the appropriate driver's portrait*/}

        <div className="flex flex-col text-end pl-3 pr-3 w-full align-bottom">
          <div className="flex flex-row justify-end items-center gap-1 uppercase text-right">
            {decideDriverFlag(driver, year)} {/*displaying the appropriate driver's flag*/}

            {/*displaying the appropriate driver's full name*/}
            <span className="flex gap-1 items-end">
              <span className="text-l pl-2">{driver.FirstName}</span>
              <span className="font-bold text-xl">{driver.LastName}</span>
            </span>
          </div>
          {/*displaying the appropriate driver's team name and racing number*/}
          <p className="text-sm text-white/60">{driver.TeamName}</p>
          <div className="text-[#ff1e00] font-bold text-xl">
            {driver.RacingNumber}
          </div>
        </div>
      </div>
    </div>
  );
}