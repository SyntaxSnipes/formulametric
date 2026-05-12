export function calculatePagg(Pr, Pc, Pt, Pa) {
  //check if any metrics are undefined
  if (
    Pr === undefined ||
    Pc === undefined ||
    Pt === undefined ||
    Pa === undefined
  ) {
    //log error and return null
    console.warn("Invalid input for Pagg calculation");
    return null;
  }
  return Number((0.3 * Pr + 0.23 * Pt + 0.23 * Pa + 0.24 * Pc).toFixed(2));
  //round to 2 d.p.
}