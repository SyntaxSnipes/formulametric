//mapping dict to map the selected sort factor key to the corresponding key in the driver objects for sorting
const mappingDict = {
  Pagg: "PAggregate",
  Pc: "PConsistency",
  Pt: "PTrajectory",
  Pa: "PAbsolute",
  Pr: "PRelative",
};

//quickSort function to sort an array of driver objects based on the selected sort factor and order using the quicksort algorithm
export default function quickSort(array, selectedSortFactor, sortOrder) {
  if (array.length <= 1) { //base case if the array has 0 or 1 elements, it's sorted so return
    return array;
  }
  let ltArr = []; //array to hold elements less than the pivot
  let eqArr = []; //array to hold elements equal to the pivot
  let gtArr = []; //array to hold elements greater than the pivot

  const key = mappingDict[selectedSortFactor]; //getting the corresponding key in the driver objects for the selected sort factor using the mapping dict

  let pivot = array[Math.floor(Math.random() * array.length)]; //choosing a random element as the pivot for partitioning

  //partitioning the array into ltArr, eqArr, and gtArr based on the selected sort order (ascending or descending)
  if (sortOrder === "asc") {
    for (let i = 0; i < array.length; i++) {
      if (array[i][key] > pivot[key]) {
        gtArr.push(array[i]);
      } else if (array[i][key] < pivot[key]) {
        ltArr.push(array[i]);
      } else {
        eqArr.push(array[i]);
      }
    }
  } else if (sortOrder === "desc") {
    for (let i = 0; i < array.length; i++) {
      if (array[i][key] < pivot[key]) {
        gtArr.push(array[i]);
      } else if (array[i][key] > pivot[key]) {
        ltArr.push(array[i]);
      } else {
        eqArr.push(array[i]);
      }
    }
  }

  //recursively sorting the ltArr and gtArr and concatenating the results with eqArr to get the final sorted array
  return [
    ...quickSort(ltArr, selectedSortFactor, sortOrder),
    ...eqArr,
    ...quickSort(gtArr, selectedSortFactor, sortOrder),
  ];
}
