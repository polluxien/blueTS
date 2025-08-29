export class ClassTuple {
  constructor(
    simpleTuple: [string, number],
    optionalTuple: [string, number, boolean?],
    restTuple: [string, ...number[]]
  ) {}
}