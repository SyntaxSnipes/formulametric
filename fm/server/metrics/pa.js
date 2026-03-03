export function calculatePaZ(points, mean, std) {
  //if std is 0, all points are same, so return neutral Pa
  if (!std || std === 0) return 0.5;

  const z = (points - mean) / std; //normalize points
  const pa = 1 / (1 + Math.exp(-z)); //logistic sigmoid
  return Number(pa.toFixed(2)); //round to 2 d.p.
}