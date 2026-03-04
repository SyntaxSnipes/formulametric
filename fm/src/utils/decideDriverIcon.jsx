import driverImages from "../assets/icons/driverImages.js";
import normalizeName from "./normalizeName.jsx";

//function that takes in a driver object and a year, and returns the corresponding driver image for that year.
export default function decideDriverIcon(driver, year, isRanking) {
  if (!driver || !driver.LastName || !year) return null;

  const key = normalizeName(driver.LastName); //this is to handle the edgecase with special letter "hülkenberg" to "hulkenberg"
  const img = driverImages[key]?.[year]; //accessing the driver image from the driverImages object using the normalized last name and year as keys

  //if no image is found, log error
  if (!img) {
    console.warn(`Image not found for: ${key}, year: ${year}`);
    return null;
  }

  //returns different versions of the image, with different styling
  return (
    isRanking ? <img src={img} alt={driver.LastName} className="w-[110px] h-full object-cover" /> : <img src={img} alt={driver.LastName} className="w-[110px] h-full object-cover rounded-s-xl" />
  );
}
