export function calculatePt(positions) {
  if (!Array.isArray(positions) || positions.length < 8) {
    console.warn("Pt calculation skipped due to insufficient data");
    return 0.5; //neutral trajectory if not enough races
  }

  let n = positions.length;
  let qSize = Math.floor(n / 4);

  //extract quartiles
  let Q1 = positions.slice(0, qSize);
  let Q2 = positions.slice(qSize, 2 * qSize);
  let Q3 = positions.slice(2 * qSize, 3 * qSize);
  let Q4 = positions.slice(3 * qSize);

  //compute average positions for each quartile
  let avgQ1 = Q1.reduce((sum, pos) => sum + pos, 0) / Q1.length;
  let avgQ2 = Q2.reduce((sum, pos) => sum + pos, 0) / Q2.length;
  let avgQ3 = Q3.reduce((sum, pos) => sum + pos, 0) / Q3.length;
  let avgQ4 = Q4.reduce((sum, pos) => sum + pos, 0) / Q4.length;

  //compute trajectory trends
  let longTermTrend = (avgQ1 - avgQ4) / Math.max(avgQ1, avgQ4);
  let midTermTrend = (avgQ2 - avgQ3) / Math.max(avgQ2, avgQ3);

  let k = 1.5; //weighting factor to adjust sensitivity of Pt to trajectory trends
  
  //compute final trajectory score
  let Pt = k * (0.5 + 0.15 * longTermTrend + 0.1 * midTermTrend);

  //return Pt rounded to 2 d.p., and ensure it's between 0 and 1
  return Number(Math.max(0, Math.min(1, Pt))).toFixed(2);
}