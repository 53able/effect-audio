/**
例: 配列内の最大値を求める関数
まず、特定の型に対して配列内の最大値を求める関数を定義します。
次に、これをジェネリックにリフティングして、任意の型に対して動作するようにします。
 */
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

/**
リフティング:
ジェネリック関数に一般化
この関数をジェネリックにリフティングし、任意の型の配列に対して最大値を求められるようにします。
 */
{
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
}

/**
解説
ジェネリック関数の定義:
function findMax<T>(arr: T[], compare: (a: T, b: T) => number): T は、型パラメーター T を使用し、任意の型の配列に対して動作する関数を定義しています。
compare 関数は2つの要素を比較し、a が b より大きければ正の数、小さければ負の数、等しければ0を返します。

エラーハンドリング:
配列が空の場合にエラーを投げることで、不正な操作を防ぎます。

reduceを使用した最大値の計算:
arr.reduce((max, item) => compare(max, item) > 0 ? max : item) で配列を巡回し、compare 関数を使って各要素を比較し、最大値を求めます。

まとめ
ジェネリック関数テンプレートを使用することで、特定の型に依存しない汎用的なアルゴリズムを作成できます。
これはリフティングと呼ばれるプロセスで、具体的な関数をより一般的な形に拡張することにより、多様なデータ型に対して柔軟に適用できるようになります。これにより、再利用性とコードの保守性が向上します。
 */
