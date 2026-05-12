import { sleep } from './sleep.js'

/**
 * Retries a function with exponential backoff for 429 errors.
 * @param {() => Promise<any>} func Function to retry.
 * @param {boolean} is429 Whether the last error was 429.
 * @param {number} cRetry Current retry count.
 * @param {number} mRetry Max retry count.
 * @returns {Promise<any|undefined>} Function result or undefined.
 */
export async function eBackoffRetry(func, is429, cRetry, mRetry) {
  let sleepAmt = 500; //default sleep amount of 500ms, further retries will exponentially increase this amount
  sleepAmt = 2 ** cRetry * 500; //exponential backoff calculation, doubling the sleep amount with each retry
  if (is429 && cRetry <= mRetry) {
    await sleep(sleepAmt); //sleeping for the calculated amount before retrying the function
    try {
      return await func(); //trying to execute the function again after the sleep, if it succeeds, return the result
    } catch (error) {
      //check if error is 429
      const still429 = error.response?.status === 429; 
      console.log(
        `Tried, sleep ${sleepAmt}ms, retry ${cRetry} (still429=${still429})`,
      );

      //recursively call eBackoffRetry until a response is received or max retries is hit, passing the updated retry count and whether the error is still a 429
      return await eBackoffRetry(func, still429, cRetry + 1, mRetry);
    }
  }
  return undefined;
}