export default function quickSort(array, selectedSortFactor, sortOrder) {
  if (array.length <= 1) {
    return array;
  }
  let ltArr = [];
  let gtArr = [];

  let pivot = array[array.length - 1];

  if (selectedSortFactor === "Pagg") {
    if (sortOrder === "asc") {
      for (let i = 0; i < array.length; i++) {
        if (array[i].PAggregate > pivot.PAggregate) {
          gtArr.push(array[i]);
        } else if (array[i].PAggregate < pivot.PAggregate) {
          ltArr.push(array[i]);
        } else {
          continue;
        }
      }
    } else if (sortOrder === "desc") {
      for (let i = 0; i < array.length; i++) {
        if (array[i].PAggregate < pivot.PAggregate) {
          gtArr.push(array[i]);
        } else if (array[i].PAggregate > pivot.PAggregate) {
          ltArr.push(array[i]);
        } else {
          continue;
        }
      }
    }
  }
  if (selectedSortFactor === "Pc") {
    if (sortOrder === "asc") {
      for (let i = 0; i < array.length; i++) {
        if (array[i].PConsistency > pivot.PConsistency) {
          gtArr.push(array[i]);
        } else if (array[i].PConsistency < pivot.PConsistency) {
          ltArr.push(array[i]);
        } else {
          continue;
        }
      }
    } else if (sortOrder === "desc") {
      for (let i = 0; i < array.length; i++) {
        if (array[i].PConsistency < pivot.PConsistency) {
          gtArr.push(array[i]);
        } else if (array[i].PConsistency > pivot.PConsistency) {
          ltArr.push(array[i]);
        } else {
          continue;
        }
      }
    }
  }
  if (selectedSortFactor === "Pt") {
    if (sortOrder === "asc") {
      for (let i = 0; i < array.length; i++) {
        if (array[i].PTrajectory > pivot.PTrajectory) {
          gtArr.push(array[i]);
        } else if (array[i].PTrajectory < pivot.PTrajectory) {
          ltArr.push(array[i]);
        } else {
          continue;
        }
      }
    } else if (sortOrder === "desc") {
      for (let i = 0; i < array.length; i++) {
        if (array[i].PTrajectory < pivot.PTrajectory) {
          gtArr.push(array[i]);
        } else if (array[i].PTrajectory > pivot.PTrajectory) {
          ltArr.push(array[i]);
        } else {
          continue;
        }
      }
    }
  }
  if (selectedSortFactor === "Pa") {
    if (sortOrder === "asc") {
      for (let i = 0; i < array.length; i++) {
        if (array[i].PAbsolute > pivot.PAbsolute) {
          gtArr.push(array[i]);
        } else if (array[i].PAbsolute < pivot.PAbsolute) {
          ltArr.push(array[i]);
        } else {
          continue;
        }
      }
    } else if (sortOrder === "desc") {
      for (let i = 0; i < array.length; i++) {
        if (array[i].PAbsolute < pivot.PAbsolute) {
          gtArr.push(array[i]);
        } else if (array[i].PAbsolute > pivot.PAbsolute) {
          ltArr.push(array[i]);
        } else {
          continue;
        }
      }
    }
  }
  if (selectedSortFactor === "Pr") {
    if (sortOrder === "asc") {
      for (let i = 0; i < array.length; i++) {
        if (array[i].PRelative > pivot.PRelative) {
          gtArr.push(array[i]);
        } else if (array[i].PRelative < pivot.PRelative) {
          ltArr.push(array[i]);
        } else {
          continue;
        }
      }
    } else if (sortOrder === "desc") {
      for (let i = 0; i < array.length; i++) {
        if (array[i].PRelative < pivot.PRelative) {
          gtArr.push(array[i]);
        } else if (array[i].PRelative > pivot.PRelative) {
          ltArr.push(array[i]);
        } else {
          continue;
        }
      }
    }
  }
  return [
    ...quickSort(ltArr, selectedSortFactor, sortOrder),
    pivot,
    ...quickSort(gtArr, selectedSortFactor, sortOrder),
  ];
}
