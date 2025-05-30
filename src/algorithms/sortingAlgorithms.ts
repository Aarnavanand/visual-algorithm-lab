
export const bubbleSort = (arr: number[]) => {
  const steps = [];
  const array = [...arr];
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        array: [...array],
        comparing: [j, j + 1],
        swapping: [],
        sorted: Array.from({ length: i }, (_, k) => n - 1 - k)
      });

      if (array[j] > array[j + 1]) {
        steps.push({
          array: [...array],
          comparing: [j, j + 1],
          swapping: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k)
        });
        
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
  }

  steps.push({
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i)
  });

  return steps;
};

export const selectionSort = (arr: number[]) => {
  const steps = [];
  const array = [...arr];
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    
    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...array],
        comparing: [minIdx, j],
        swapping: [],
        sorted: Array.from({ length: i }, (_, k) => k)
      });

      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      steps.push({
        array: [...array],
        comparing: [],
        swapping: [i, minIdx],
        sorted: Array.from({ length: i }, (_, k) => k)
      });
      
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
    }
  }

  steps.push({
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i)
  });

  return steps;
};

export const insertionSort = (arr: number[]) => {
  const steps = [];
  const array = [...arr];
  const n = array.length;

  for (let i = 1; i < n; i++) {
    let key = array[i];
    let j = i - 1;

    steps.push({
      array: [...array],
      comparing: [i],
      swapping: [],
      sorted: Array.from({ length: i }, (_, k) => k)
    });

    while (j >= 0 && array[j] > key) {
      steps.push({
        array: [...array],
        comparing: [j, j + 1],
        swapping: [j, j + 1],
        sorted: Array.from({ length: i }, (_, k) => k)
      });

      array[j + 1] = array[j];
      j--;
    }
    
    array[j + 1] = key;
  }

  steps.push({
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i)
  });

  return steps;
};

export const mergeSort = (arr: number[]) => {
  const steps: any[] = [];
  const array = [...arr];

  const merge = (left: number, mid: number, right: number) => {
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      steps.push({
        array: [...array],
        comparing: [left + i, mid + 1 + j],
        swapping: [],
        sorted: []
      });

      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i];
        i++;
      } else {
        array[k] = rightArr[j];
        j++;
      }
      k++;
    }

    while (i < leftArr.length) {
      array[k] = leftArr[i];
      i++;
      k++;
    }

    while (j < rightArr.length) {
      array[k] = rightArr[j];
      j++;
      k++;
    }
  };

  const mergeSortHelper = (left: number, right: number) => {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergeSortHelper(left, mid);
      mergeSortHelper(mid + 1, right);
      merge(left, mid, right);
    }
  };

  mergeSortHelper(0, array.length - 1);

  steps.push({
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: array.length }, (_, i) => i)
  });

  return steps;
};

export const quickSort = (arr: number[]) => {
  const steps: any[] = [];
  const array = [...arr];

  const partition = (low: number, high: number) => {
    const pivot = array[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      steps.push({
        array: [...array],
        comparing: [j, high],
        swapping: [],
        sorted: []
      });

      if (array[j] < pivot) {
        i++;
        if (i !== j) {
          steps.push({
            array: [...array],
            comparing: [j, high],
            swapping: [i, j],
            sorted: []
          });
          [array[i], array[j]] = [array[j], array[i]];
        }
      }
    }

    steps.push({
      array: [...array],
      comparing: [],
      swapping: [i + 1, high],
      sorted: []
    });
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    
    return i + 1;
  };

  const quickSortHelper = (low: number, high: number) => {
    if (low < high) {
      const pi = partition(low, high);
      quickSortHelper(low, pi - 1);
      quickSortHelper(pi + 1, high);
    }
  };

  quickSortHelper(0, array.length - 1);

  steps.push({
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: array.length }, (_, i) => i)
  });

  return steps;
};
