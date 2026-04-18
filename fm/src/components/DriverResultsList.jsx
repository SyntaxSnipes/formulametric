export default function DriverResultsList({ results }) {
  return (
    <span>
      {results.map((race, index) => (
        <div
          key={index}
          className="flex border border-[#ff1e00] rounded-lg p-1 my-0.5 gap-4 text-white bg-[#1e1e1e]"
        >
          <h3 className="text-xs text-[#ff1e00] font-bold">
            {race.RoundNo}. {race.Track}
          </h3>
          <p className="text-[10px]">
            {new Date(race.Date).toLocaleDateString()}
          </p>
          <p className="text-[10px]">Position: {race.Position}</p>
          <p className="text-[10px]">Status: {race.Status}</p>
        </div>
      ))}
    </span>
  );
}
