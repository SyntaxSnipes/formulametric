/**
 * Creates a min-heap of the top 3 drivers by aggregate score.
 * @param {Array<Object>} arr Array of driver objects with PAggregate property.
 * @returns {Array<Object>} Min-heap containing top 3 drivers by aggregate score.
 */
export function makeMinHeap(arr) {
  let mHeap = [];
  for (let i = 0; i < arr.length; i++) {
    if (i < 3) {
      mHeap.push(arr[i]);
      bubbleUp(mHeap, i);
    } else {
      if (arr[i]["PAggregate"] < mHeap[0]["PAggregate"]) continue;
      else {
        mHeap[0] = arr[i];
        siftDown(mHeap, 0);
      }
    }
  }
  return mHeap;
}

/**
 * Moves a node up the heap to maintain min-heap property.
 * @param {Array<Object>} mHeap Min-heap array.
 * @param {number} i Index of the node to bubble up.
 */
export function bubbleUp(mHeap, i) {
  if (i === 0) return;
  let nodeParentIndex = Math.floor((i - 1) / 2);
  if (mHeap[nodeParentIndex]["PAggregate"] <= mHeap[i]["PAggregate"]) return;
  else if (mHeap[nodeParentIndex]["PAggregate"] > mHeap[i]["PAggregate"]) {
    let temp = mHeap[i];
    mHeap[i] = mHeap[nodeParentIndex];
    mHeap[nodeParentIndex] = temp;
    bubbleUp(mHeap, nodeParentIndex);
  }
}

/**
 * Moves a node down the heap to maintain min-heap property.
 * @param {Array<Object>} mHeap Min-heap array.
 * @param {number} i Index of the node to sift down.
 */
export function siftDown(mHeap, i) {
  let childIndex1 = 2 * i + 1;
  let childIndex2 = 2 * i + 2;
  if (childIndex1 >= mHeap.length) return;
  if (childIndex2 >= mHeap.length) {
    if (mHeap[i]["PAggregate"] > mHeap[childIndex1]["PAggregate"]) {
      let temp = mHeap[i];
      mHeap[i] = mHeap[childIndex1];
      mHeap[childIndex1] = temp;
    }
    return;
  }
  if (
    mHeap[i]["PAggregate"] <= mHeap[childIndex1]["PAggregate"] &&
    mHeap[i]["PAggregate"] <= mHeap[childIndex2]["PAggregate"]
  )
    return;
  else if (
    mHeap[childIndex1]["PAggregate"] > mHeap[childIndex2]["PAggregate"]
  ) {
    let temp = mHeap[i];
    mHeap[i] = mHeap[childIndex2];
    mHeap[childIndex2] = temp;
    siftDown(mHeap, childIndex2);
  } else {
    let temp = mHeap[i];
    mHeap[i] = mHeap[childIndex1];
    mHeap[childIndex1] = temp;
    siftDown(mHeap, childIndex1);
  }
}

/**
 * Extracts and removes the root (minimum) element from the heap.
 * @param {Array<Object>} mHeap Min-heap array.
 * @returns {Object} The root (minimum) driver object.
 */
export function extractRoot(mHeap) {
  let root = mHeap[0];
  if (mHeap.length > 1) {
    mHeap[0] = mHeap[mHeap.length - 1];
    mHeap.pop();
    siftDown(mHeap, 0);
  }
  return root;
}

/**
 * Extracts all 3 drivers from the heap in descending order of aggregate score.
 * @param {Array<Object>} mHeap Min-heap array.
 * @returns {Array<Object>} Array of 3 drivers sorted by aggregate score (highest first).
 */
export function generateTop3(mHeap) {
  let top3 = [];
  for (let i = 0; i < 3; i++) {
    let x = extractRoot(mHeap);
    top3.unshift(x);
  }
  return top3;
}
