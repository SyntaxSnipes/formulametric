export function calculatePaZ(points, mean, std) {
  if (!std || std === 0) return 0.5;

  const z = (points - mean) / std;
  const pa = 1 / (1 + Math.exp(-z)); // logistic sigmoid
  return Number(pa.toFixed(2));
}