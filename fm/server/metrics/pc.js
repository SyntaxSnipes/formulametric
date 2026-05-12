export function calculatePc(sumpos, sumpos2, n) {
  //checking for edge cases, and dealing with them
  if (sumpos === 0 || n === 0 || sumpos2 === 0) return 0;
  if (n < 5) return null;

  const mean = sumpos / n;
  const std = Math.sqrt(sumpos2 / n - mean ** 2);

  //scaling factor k for reasonable spread for Pc
  const k = 6.15;

  const Pc = 1 - (std / k) ** 2;

  //return Pc rounded to 2 d.p., and ensure it's between 0 and 1
  return Number(Math.max(0, Math.min(1, Pc)).toFixed(2));
}