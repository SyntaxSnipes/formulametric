import flags from "../assets/icons/flags";

export default function decideDriverFlag(driver) {
  if (!driver?.Country) return null; //if driver or driver.Country is undefined, return null

  //formatting the country name to match the keys in the flags object by removing spaces, hyphens, and the word "Republic"
  const key = driver.Country.replace(/\s+/g, "")
    .replace("-", "")
    .replace("Republic", "")
    .trim();
  const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();

  //getting the flag from the flags object using the formatted country name as the key
  const flag = flags[formattedKey];


  if (!flag) {
    console.warn(`Flag not found for key: ${formattedKey}`);
    return null;
  }
  return (
    <img
      src={flag}
      alt={driver.Country}
      className="w-[30px] h-[20px] object-cover rounded-sm"
    />
  );
}
