export function calculatePc(sumpos, sumpos2, n) {
  if (sumpos === 0 || n === 0 || sumpos2 === 0) return 0;
  if (n < 5) return null;

  // Calculate mean and standard deviation
  const mean = sumpos / n;
  const std = Math.sqrt(sumpos2 / n - mean ** 2);

  console.log(
    `DEBUG: sumpos=${sumpos}, sumpos2=${sumpos2}, n=${n}, std=${std}, mean=${mean}`,
  );

  const k = 6.15;
  const Pc = 1 - (std / k) ** 2;
  return Number(Math.max(0, Math.min(1, Pc)).toPrecision(2));
}