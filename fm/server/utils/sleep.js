//Sleep function to cause a temporary 'pause' in code execution, necessary for the other utils algo
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}