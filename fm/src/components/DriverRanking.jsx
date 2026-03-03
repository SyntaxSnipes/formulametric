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
    // styling the driver card with conditional formatting to highlight the selected sorting factor, and displaying the driver's portrait, flag, name, team, and performance metrics
    <div className="w-full m-2 h-min bg-[#1e1e1e] rounded-xl text-white flex flex-col justify-between border border-[#e8e8e8] shadow-lg hover:bg-slate-900 shadow-[#ff1e0009]">
      <div className="flex flex-row justify-between items-center h-fit w-auto">
        <span className="text-center text-white/60">{index}</span>
        {decideDriverIcon(driver, year)} {/*displaying the appropriate driver's portrait*/}

        <div className="flex flex-row text-end pl-3 pr-3 w-full justify-between">
          <div>
            <div className="flex flex-row-reverse justify-end items-center gap-1 uppercase text-right">
              {decideDriverFlag(driver, year)} {/*displaying the appropriate driver's flag*/}

              {/*displaying the appropriate driver's full name*/}
              <span className="flex gap-1 items-end">
                <span className="text-l">{driver.FirstName}</span>
                <span className="font-bold text-xl">{driver.LastName}</span>
              </span>
            </div>
            <p className="text-sm text-white/60 text-left">{driver.TeamName}</p> {/*displaying the appropriate driver's team name*/}
          </div>

          {/*displaying all the metrics, with the metrics changing color based on the selected sort factor*/} 
          <div className="text-[#ff1e00] font-bold text-xl h-min flex flex-row align-center my-auto justify-between gap-5">
            <span
              className="h-min"
              style={selectedSortFactor === "Pc" ? { color: "#fff" } : {}}
            >
              Pc: {driver.PConsistency.toPrecision(2)} {/*rounded to 2 s.f. just in case*/}
            </span>
            <span
              className="h-min"
              style={selectedSortFactor === "Pt" ? { color: "#fff" } : {}}
            >
              Pt: {driver.PTrajectory.toPrecision(2)} {/*rounded to 2 s.f. just in case*/}
            </span>
            <span
              className="h-min"
              style={selectedSortFactor === "Pa" ? { color: "#fff" } : {}}
            >
              Pa: {driver.PAbsolute.toPrecision(2)} {/*rounded to 2 s.f. just in case*/}
            </span>
            <span
              className="h-min"
              style={selectedSortFactor === "Pr" ? { color: "#fff" } : {}}
            >
              Pr: {driver.PRelative.toPrecision(2)} {/*rounded to 2 s.f. just in case*/}
            </span>
            <span
              className="h-min"
              style={selectedSortFactor === "Pagg" ? { color: "#fff" } : {}}
            >
              Pagg: {driver.PAggregate.toPrecision(2)} {/*rounded to 2 s.f. just in case*/}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
