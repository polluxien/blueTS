import { Path } from "typescript";
import { TSClassAnalyzer } from "../../services/tsCompilerApi/TSClassAnalyzer.class";
import path from "path";
import { ClassResource } from "../../_resources/tsCompilerAPIResources";

const giveMeTSResource = (fileName: string) => ({
  name: `${fileName}.ts`,
  path: path.resolve(
    __dirname,
    `../mockCode/tsCompiler/paramTypes/${fileName}.ts`
  ) as Path,
});

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> BASIC", () => {
  test("erkenne Eingabeparameter: string", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassString")]);
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "string",
        paramType: "basic",
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: number", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassNumber")]);
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "number",
        paramType: "basic",
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: boolean", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassBoolean")]);
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "boolean",
        paramType: "basic",
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });
});

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> WEIRD", () => {
  test("erkenne Eingabeparameter: never", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassNever")]);
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "never",
        paramType: "never",
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: any", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassAny")]);
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "any",
        paramType: "any",
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: unknown", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassUnknown")]);
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "unknown",
        paramType: "unknown",
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: undefined", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassUndefined")]);
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "undefined",
        paramType: "undefined",
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: null", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassNull")]);
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "null",
        paramType: "null",
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });
});
describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> ENUM", () => {
  test("erkenne Eingabeparameter: enum", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassEnum")]);
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        enumValues: ["RED", "BLUE", "YELLOW"],
        typeAsString: "myEnum",
        paramType: "enum",
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });
});

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> ARRAY", () => {
  const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassArray")]);
  const res: ClassResource[] = myAnalyser.parse();

  test("erkenne Eingabeparameter: array - string[]", () => {
    const expectedParam = {
      paramName: "stringArray",
      typeInfo: {
        typeAsString: "string[]",
        paramType: "array",
        arrayType: {
          typeAsString: "string",
          paramType: "basic",
        },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[0]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: array - number[]", () => {
    const expectedParam = {
      paramName: "numberArray",
      typeInfo: {
        typeAsString: "number[]",
        paramType: "array",
        arrayType: {
          typeAsString: "number",
          paramType: "basic",
        },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[1]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: array - boolean[]", () => {
    const expectedParam = {
      paramName: "boolArray",
      typeInfo: {
        typeAsString: "boolean[]",
        paramType: "array",
        arrayType: {
          typeAsString: "boolean",
          paramType: "basic",
        },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[2]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: array - tupel[string, number][]", () => {
    const expectedParam = {
      paramName: "tupleArray",
      typeInfo: {
        typeAsString: "[string, number][]",
        paramType: "array",
        arrayType: {
          typeAsString: "[string, number]",
          paramType: "tuple",
          tupleElements: [
            { typeAsString: "string", paramType: "basic" },
            { typeAsString: "number", paramType: "basic" },
          ],
        },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[3]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: array - object[]", () => {
    const expectedParam = {
      paramName: "objectArray",
      typeInfo: {
        typeAsString: "{ name: string; age: number; }[]",
        paramType: "array",
        arrayType: {
          typeAsString: "{ name: string; age: number; }",
          paramType: "object",
          objectParameters: [
            {
              paramName: "name",
              typeInfo: {
                typeAsString: "string",
                paramType: "basic",
              },
              optional: false,
            },
            {
              paramName: "age",
              typeInfo: {
                typeAsString: "number",
                paramType: "basic",
              },
              optional: false,
            },
          ],
        },
      },
      optional: false,
    };

    //object not implemented jet
    expect(res[0].constructor!.parameters[4]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: 2D array -> string[][]", () => {
    const expectedParam = {
      paramName: "multiDimArray",
      typeInfo: {
        typeAsString: "string[][]",
        paramType: "array",
        arrayType: {
          typeAsString: "string[]",
          paramType: "array",
          arrayType: { typeAsString: "string", paramType: "basic" },
        },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[5]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: union array -> (string | number | boolean)[]", () => {
    const expectedParam = {
      paramName: "unionArray",
      typeInfo: {
        typeAsString: "(string | number | boolean)[]",
        paramType: "array",
        arrayType: {
          typeAsString: "string | number | boolean",
          paramType: "union",
          unionValues: [
            {
              typeAsString: "string",
              paramType: "basic",
            },
            {
              typeAsString: "number",
              paramType: "basic",
            },
            {
              typeAsString: "boolean",
              paramType: "basic",
            },
          ],
        },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[6]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: genericArray -> Array<string>", () => {
    const expectedParam = {
      paramName: "genericArray",
      typeInfo: {
        typeAsString: "string[]",
        paramType: "array",
        arrayType: {
          typeAsString: "string",
          paramType: "basic",
        },
      },
      optional: false,
    };

    expect(res[0].constructor!.parameters[7]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: read only Array -> readonly string[]", () => {
    const expectedParam = {
      paramName: "readonlyArray",
      typeInfo: {
        typeAsString: "readonly string[]",
        paramType: "array",
        arrayType: {
          typeAsString: "string",
          paramType: "basic",
        },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[8]).toEqual(expectedParam);
  });
});

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> UNION", () => {
  const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassUnion")]);
  const res: ClassResource[] = myAnalyser.parse();

  console.log(JSON.stringify(res, null, 2));

  test("erkenne Eingabeparameter: string | number", () => {
    const expectedParam = {
      paramName: "stringOrNumber",
      typeInfo: {
        typeAsString: "string | number",
        paramType: "union",
        unionValues: [
          { typeAsString: "string", paramType: "basic" },
          { typeAsString: "number", paramType: "basic" },
        ],
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[0]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: number | boolean", () => {
    const expectedParam = {
      paramName: "numberOrBoolean",
      typeInfo: {
        typeAsString: "number | boolean",
        paramType: "union",
        unionValues: [
          { typeAsString: "number", paramType: "basic" },
          { typeAsString: "boolean", paramType: "basic" },
        ],
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[1]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: string | string[]", () => {
    const expectedParam = {
      paramName: "stringOrArray",
      typeInfo: {
        typeAsString: "string | string[]",
        paramType: "union",
        unionValues: [
          { typeAsString: "string", paramType: "basic" },
          {
            typeAsString: "string[]",
            paramType: "array",
            arrayType: { typeAsString: "string", paramType: "basic" },
          },
        ],
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[2]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: string[] | [number, number]", () => {
    const expectedParam = {
      paramName: "arrayOrTuple",
      typeInfo: {
        typeAsString: "string[] | [number, number]",
        paramType: "union",
        unionValues: [
          {
            typeAsString: "string[]",
            paramType: "array",
            arrayType: { typeAsString: "string", paramType: "basic" },
          },
          {
            typeAsString: "[number, number]",
            paramType: "tuple",
            tupleElements: [
              { typeAsString: "number", paramType: "basic" },
              { typeAsString: "number", paramType: "basic" },
            ],
          },
        ],
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[3]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: { name: string } | null", () => {
    const expectedParam = {
      paramName: "objectOrNull",
      typeInfo: {
        typeAsString: "{ name: string } | null",
        paramType: "union",
        unionValues: [
          {
            typeAsString: "{ name: string }",
            paramType: "object",
            objectParameters: [
              {
                paramName: "name",
                typeInfo: {
                  typeAsString: "string",
                  paramType: "basic",
                },
                optional: false,
              },
            ],
          },
          { typeAsString: "null", paramType: "null" },
        ],
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[4]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: 'start' | 'stop' | boolean", () => {
    const expectedParam = {
      paramName: "unionLiteral",
      typeInfo: {
        typeAsString: 'boolean | "start" | "stop"',
        paramType: "union",
        unionValues: [
          { typeAsString: '"start"', paramType: "literal" },
          { typeAsString: '"stop"', paramType: "literal" },
          { typeAsString: "boolean", paramType: "basic" },
        ],
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[5]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: string | (() => void)", () => {
    const expectedParam = {
      paramName: "unionFunctionOrValue",
      typeInfo: {
        typeAsString: "string | (() => void)",
        paramType: "union",
        unionValues: [
          {
            typeAsString: "string",
            paramType: "basic",
          },
          {
            typeAsString: "() => void",
            paramType: "function",
          },
        ],
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[6]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: string | number | boolean | null | undefined", () => {
    const expectedParam = {
      paramName: "complexUnion",
      typeInfo: {
        typeAsString: "string | number | boolean | null | undefined",
        paramType: "union",
        unionValues: [
          { typeAsString: "string", paramType: "basic" },
          { typeAsString: "number", paramType: "basic" },
          { typeAsString: "boolean", paramType: "basic" },
          { typeAsString: "null", paramType: "null" },
          { typeAsString: "undefined", paramType: "undefined" },
        ],
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[7]).toEqual(expectedParam);
  });
});

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> FUNCTION", () => {});

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> OBJECT", () => {});
