//Eingabeparameter functions
export class ClassFunction {
  constructor(
    simpleCallback: () => void,
    transformFunction: (x: string) => number,
    complexAsyncFunction: (
      a: number,
      b: string,
      c?: boolean
    ) => Promise<string>,
    genericFunction: Function
  ) {}
}
