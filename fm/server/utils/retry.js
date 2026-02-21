import { sleep } from './sleep.js'

export async function eBackoffRetry(func, is429, cRetry, mRetry) {
  let sleepAmt = 500;
  sleepAmt = 2 ** cRetry * 500;
  if (is429 && cRetry <= mRetry) {
    await sleep(sleepAmt);
    try {
      return await func();
    } catch (e) {
      const still429 = e.response?.status === 429;
      console.log(
        `Tried, sleep ${sleepAmt}ms, retry ${cRetry} (still429=${still429})`,
      );
      return await eBackoffRetry(func, still429, cRetry + 1, mRetry);
    }
  }
  return undefined;
}