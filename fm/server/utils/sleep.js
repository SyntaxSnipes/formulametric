/**
 * Sleeps for a given number of milliseconds.
 * @param {number} ms Delay duration in ms.
 * @returns {Promise<void>} Resolves after the delay.
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}