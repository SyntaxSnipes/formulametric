//creating DriverPodiumCard component to display the podium of drivers for a selected season
export default function DriverPodiumCard({
  driver,
  index,
  decideDriverIcon,
  decideDriverFlag,
  year,
}) {
	const bottomBorderColor = 
  index === 1 ? "border-b-4 border-b-yellow-400" :
  index === 2 ? "border-b-4 border-b-gray-400" :
  "border-b-4 border-b-amber-700"

const hoverBgColor =
  index === 1 ? "hover:bg-yellow-600" :
  index === 2 ? "hover:bg-gray-600" :
  "hover:bg-amber-800"

const elevationClass =
  index === 1 ? "mb-6" :
  index === 2 ? "mb-3" :
  "mb-0"
  return (
    <div className={`flex-1 rounded-t-xl rounded-b-none mx-auto bg-[#1e1e1e] text-white flex flex-col justify-between border border-b-6 border-[#4F4A4A] ${bottomBorderColor} ${hoverBgColor} ${elevationClass} shadow-lg shadow-[#ff1e0009] items-end z-0 transition-colors duration-300`}>
      <div className={`flex flex-row justify-between items-center h-fit w-full`}>
        {decideDriverIcon(driver, year, true)}{" "}
        {/*displaying the appropriate driver's portrait*/}
        <div className="flex flex-row text-end pl-6 pr-3 py-4 w-full justify-between gap-6">
          <div>
            <div className="flex flex-row justify-end items-center gap-1 uppercase text-right">
              {/*displaying the appropriate driver's flag*/}
              {decideDriverFlag(driver, year)}{" "}
              {/*displaying the appropriate driver's full name*/}
              <span className="flex gap-1 items-end">
                <span className="text-l">{driver.FirstName}</span>
                <span className="font-bold text-xl">{driver.LastName}</span>
              </span>
            </div>
            <p className="text-sm text-white/60 text-right">{driver.TeamName}</p>{" "}
            {/*displaying the appropriate driver's team name*/}
            <span className="h-min">Aggregate Score: {driver.PAggregate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
