//EingabeParameter Union

export class ClassUnion {
  private stringOrNumber: string | number;
  private numberOrBoolean: number | boolean;
  private stringOrArray: string | string[];
  private arrayOrTuple: string[] | [number, number];
  private objectOrNull: { name: string } | null;
  private unionLiteral: "start" | "stop" | boolean;
  private unionFunctionOrValue: (() => void) | string;
  private complexUnion: string | number | boolean | null | undefined;

  constructor(
    stringOrNumber: string | number,
    numberOrBoolean: number | boolean,
    stringOrArray: string | string[],
    arrayOrTuple: string[] | [number, number],
    objectOrNull: { name: string } | null,
    unionLiteral: "start" | "stop" | boolean,
    unionFunctionOrValue: (() => void) | string,
    complexUnion: string | number | boolean | null | undefined
  ) {
    this.stringOrNumber = stringOrNumber;
    this.numberOrBoolean = numberOrBoolean;
    this.stringOrArray = stringOrArray;
    this.arrayOrTuple = arrayOrTuple;
    this.objectOrNull = objectOrNull;
    this.unionLiteral = unionLiteral;
    this.unionFunctionOrValue = unionFunctionOrValue;
    this.complexUnion = complexUnion;
  }
}
