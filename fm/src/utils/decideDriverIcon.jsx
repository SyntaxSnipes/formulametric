import driverImages from "../assets/icons/driverImages.js";
import normalizeName from "./normalizeName.jsx";

export default function decideDriverIcon(driver, year) {
  if (!driver || !driver.LastName || !year) return null;

  const key = normalizeName(driver.LastName); // This is to handle the edgecase with special letter "hülkenberg" -> "hulkenberg"
  const img = driverImages[key]?.[year];

  if (!img) {
    console.warn(`Image not found for: ${key}, year: ${year}`);
    return null;
  }

  return (
    <img
      src={img}
      alt={driver.LastName}
      className="w-[110px] h-full object-cover rounded-s-xl"
    />
  );
}
