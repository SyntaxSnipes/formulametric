const mappingDict = {
  Pagg: "PAggregate",
  Pc: "PConsistency",
  Pt: "PTrajectory",
  Pa: "PAbsolute",
  Pr: "PRelative",
};

export default function quickSort(array, selectedSortFactor, sortOrder) {
  if (array.length <= 1) {
    return array;
  }
  let ltArr = [];
  let eqArr = [];
  let gtArr = [];

  const key = mappingDict[selectedSortFactor];

  let pivot = array[array.length - 1];

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

  return [
    ...quickSort(ltArr, selectedSortFactor, sortOrder),
    ...eqArr,
    ...quickSort(gtArr, selectedSortFactor, sortOrder),
  ];
}
