export function calculatePr(dWin, tWin) {
  console.log(`DEBUG: dWin=${dWin}, tWin=${tWin}`);
  if (dWin + tWin === 0) return 0;
  return Math.min(1, Number((dWin / (dWin + tWin)).toPrecision(2)));
}