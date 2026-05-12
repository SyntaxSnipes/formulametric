//creating DriverRanking component to display a sorted ranked list of drivers based on their performance metrics
export default function DriverRanking({
  driver,
  index,
  decideDriverIcon,
  decideDriverFlag,
  selectedSortFactor,
  year,
}) {
  return (
    <div className="w-full h-min rounded-xl mx-auto bg-[#1e1e1e] text-white flex flex-col justify-between border border-[#4F4A4A] shadow-lg hover:bg-slate-900 shadow-[#ff1e0009] z-0 p-2 sm:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-fit w-full gap-2">
        <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
          <span className="text-center mx-2 text-white/60 text-xs sm:text-base">{index}</span>
          {decideDriverIcon(driver, year, true)} {/*displaying the appropriate driver's portrait*/}

          <div className="flex flex-col text-left pl-1 pr-3 flex-1 sm:flex-none">
            <div className="flex flex-row justify-start items-center gap-1 uppercase text-left">
              {decideDriverFlag(driver, year)} {/*displaying the appropriate driver's flag*/}

              {/*displaying the appropriate driver's full name*/}
              <span className="flex gap-1 items-end">
                <span className="text-sm sm:text-base">{driver.FirstName}</span>
                <span className="font-bold text-base sm:text-xl">{driver.LastName}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/60 text-left">{driver.TeamName}</p> {/*displaying the appropriate driver's team name*/}
          </div>
        </div>

        {/*displaying all the metrics, with the metrics changing color based on the selected sort factor*/} 
        <div className="text-[#ff1e00] font-bold text-sm sm:text-xl h-min flex flex-row align-center my-auto justify-between gap-3 sm:gap-5 w-full sm:w-auto flex-wrap sm:flex-nowrap sm:mr-4">
          <span
            className="h-min"
            style={selectedSortFactor === "Pc" ? { color: "#fff" } : {}}
          >
            Pc: {driver.PConsistency}
          </span>
          <span
            className="h-min"
            style={selectedSortFactor === "Pt" ? { color: "#fff" } : {}}
          >
            Pt: {driver.PTrajectory}
          </span>
          <span
            className="h-min"
            style={selectedSortFactor === "Pa" ? { color: "#fff" } : {}}
          >
            Pa: {driver.PAbsolute}
          </span>
          <span
            className="h-min"
            style={selectedSortFactor === "Pr" ? { color: "#fff" } : {}}
          >
            Pr: {driver.PRelative}
          </span>
          <span
            className="h-min"
            style={selectedSortFactor === "Pagg" ? { color: "#fff" } : {}}
          >
            Pagg: {driver.PAggregate}
          </span>
        </div>
      </div>
    </div>
  );
}
