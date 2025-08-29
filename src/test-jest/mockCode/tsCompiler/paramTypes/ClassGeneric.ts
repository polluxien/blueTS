interface User {
  name: string;
  email: string;
}

export class ClassGeneric {
  constructor(
    genericArray: Array<string>,
    promiseNumber: Promise<number>,
    stringToNumberMap: Map<string, number>,
    userSet: Set<User>,
    nestedGeneric: Promise<Array<string>>
  ) {}
}