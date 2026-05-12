//creating DriverPodiumCard component to display the podium card for a driver
export default function DriverPodiumCard({
  driver,
  index,
  decideDriverIcon,
  decideDriverFlag,
  year,
}) {
  //determining the bottom border color based on podium position
  const bottomBorderColor =
    index === 1
      ? "border-b-4 border-b-yellow-400"
      : index === 2
        ? "border-b-4 border-b-gray-400"
        : "border-b-4 border-b-amber-700";

  //determining the hover background color based on podium position
  const hoverBgColor =
    index === 1
      ? "hover:bg-yellow-600"
      : index === 2
        ? "hover:bg-gray-600"
        : "hover:bg-amber-800";

  //determining the vertical elevation to create the podium step effect
  const elevationClass =
    index === 1 ? "mb-8 sm:mb-10" : index === 2 ? "mb-4 sm:mb-6" : "mb-0";

  return (
    <div
      className={`flex-1 sm:w-56 sm:flex-none min-w-0 rounded-t-xl rounded-b-none bg-[#1e1e1e] text-white flex flex-col border border-[#4F4A4A] ${bottomBorderColor} ${hoverBgColor} ${elevationClass} shadow-lg shadow-[#ff1e0009] z-0 transition-colors duration-300 overflow-hidden`}
    >
      {/*driver portrait — full width at top of card*/}
      {/*driver portrait — fixed height, image fills consistently*/}
      <div className="w-full h-36 sm:h-48 overflow-hidden [&_img]:!w-full [&_img]:!h-full [&_img]:!rounded-none">
        {decideDriverIcon(driver, year, true)}
      </div>

      {/*driver info section*/}
      <div className="flex flex-col px-2 sm:px-3 py-2 sm:py-3 gap-1">
        {/*flag, first name and last name — all on one line on desktop*/}
        <div className="flex flex-row items-center gap-1 flex-wrap sm:flex-nowrap">
          <div className="hidden sm:block flex-shrink-0">
            {decideDriverFlag(driver, year)}
          </div>
          <span className="text-xs sm:text-base leading-tight text-white/70 sm:whitespace-nowrap">
            {driver.FirstName}
          </span>
          <span className="font-bold text-sm sm:text-xl leading-tight sm:whitespace-nowrap">
            {driver.LastName}
          </span>
        </div>

        {/*team name*/}
        <p className="hidden sm:block text-xs text-white/60 truncate">
          {driver.TeamName}
        </p>

        {/*aggregate score*/}
        <span className="text-xs sm:text-sm text-white/80">
          Aggregate Score: {driver.PAggregate}
        </span>
      </div>
    </div>
  );
}
