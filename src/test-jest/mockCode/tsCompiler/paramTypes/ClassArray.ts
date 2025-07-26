//EingabeParameter string Array
export class arr {
  private stringArray: string[];
  private numberArray: number[];
  private boolArray: boolean[];
  private tupleArray: [string, number][];
  private objectArray: { name: string; age: number }[];
  private multiDimArray: string[][];
  private unionArray: (string | number | boolean)[];
  private genericArray: Array<string>;
  private readonlyArray: readonly string[];

  constructor(
    stringArray: string[],
    numberArray: number[],
    boolArray: boolean[],
    tupleArray: [string, number][],
    objectArray: { name: string; age: number }[],
    multiDimArray: string[][],
    unionArray: (string | number | boolean)[],
    genericArray: Array<string>,
    readonlyArray: readonly string[],
  ) {
    this.stringArray = stringArray;
    this.numberArray = numberArray;
    this.boolArray = boolArray;
    this.tupleArray = tupleArray;
    this.objectArray = objectArray;
    this.multiDimArray = multiDimArray;
    this.unionArray = unionArray;
    this.genericArray = genericArray;
    this.readonlyArray = readonlyArray;
  }
}
