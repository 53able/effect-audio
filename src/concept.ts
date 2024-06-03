/**
コンセプト
ジェネリックは、引数や関数、クラスなどの一部が特定の型に依存しないようにするために使用されます。
これにより、再利用性が高く、型安全性が保たれるコードを書くことができます。
 */
{
  // ジェネリック関数の例を見てみましょう：
  function identity<T>(arg: T): T {
    return arg;
  }

  // 使用例
  let output1 = identity<string>("Hello");
  let output2 = identity<number>(42);
  // このidentity関数は、引数の型をそのまま戻り値の型として使用します。<T>は型パラメータで、関数を呼び出すときに具体的な型を指定します。
}

{
  /**
クラスにおけるジェネリック
ジェネリックをクラスに適用することもできます：
   */
  class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;

    constructor(zeroValue: T, add: (x: T, y: T) => T) {
      this.zeroValue = zeroValue;
      this.add = add;
    }
  }

  // 使用例
  let myGenericNumber = new GenericNumber<number>(0, (x, y) => x + y);
  console.log(myGenericNumber.add(5, 10)); // 15
}

{
  /**
テンプレートの要件
ジェネリックを使用する際の要件は、その型が関数やクラスで使用される方法によって異なります。例えば、特定のプロパティやメソッドが存在することを要求する場合は、型制約を使用します：
   */
  interface Lengthwise {
    length: number;
  }

  function logLength<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);
    return arg;
  }

  // 使用例
  logLength({ length: 10, value: "Hello" }); // 10

  // この例では、logLength関数は、lengthプロパティを持つオブジェクトのみを受け入れます。
}

{
  /**
無限に存在する可能性
テンプレート引数として受け入れられる型の条件は無限に存在する可能性があります。なぜなら、クラスや関数に求められる性質は様々であり、それぞれ異なる条件を満たす必要があるからです。

例えば、以下のように異なる型制約を設けることができます：


   */
  interface Summable {
    sum: () => number;
  }

  class SummableArray implements Summable {
    items: number[];
    constructor(items: number[]) {
      this.items = items;
    }
    sum() {
      return this.items.reduce((a, b) => a + b, 0);
    }
  }

  function getSum<T extends Summable>(obj: T): number {
    return obj.sum();
  }

  // 使用例
  let myArray = new SummableArray([1, 2, 3, 4]);
  console.log(getSum(myArray)); // 10

  // このように、テンプレートを使用することで、多様な型に対して柔軟に対応できる汎用的なコードを書くことが可能になります。
}
