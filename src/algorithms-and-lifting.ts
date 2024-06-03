{
  // 具体的な型に対する最大値を求める関数（number型）
  function findMaxNumber(arr: number[]): number {
    return Math.max(...arr);
  }

  // 使用例
  const numbers = [1, 2, 3, 4, 5];
  const maxNumber = findMaxNumber(numbers);
  console.log(maxNumber); // 出力: 5
}

// ジェネリック型 T を使った最大値を求める関数
function findMax<T>(arr: T[], compare: (a: T, b: T) => number): T {
  if (arr.length === 0) {
    throw new Error("Array is empty.");
  }
  return arr.reduce((max, item) => (compare(max, item) > 0 ? max : item));
}

// 使用例: number型の配列
const numbers = [1, 2, 3, 4, 5];
const maxNumber = findMax(numbers, (a, b) => a - b);
console.log(maxNumber); // 出力: 5

// 使用例: string型の配列
const strings = ["apple", "banana", "cherry"];
const maxString = findMax(strings, (a, b) => a.localeCompare(b));
console.log(maxString); // 出力: cherry
