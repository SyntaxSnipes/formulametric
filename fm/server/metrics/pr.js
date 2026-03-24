export function calculatePr(dWin, tWin) {
  //checking edge case, dealing with it
  if (dWin + tWin === 0) return 0;
  
  //return Pr rounded to 2 d.p., and ensure it's between 0 and 1
  return Number(Math.max(0, Math.min(1, (dWin / (dWin + tWin)))).toFixed(2));
}