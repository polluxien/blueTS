import { Path } from "typescript";
import { TSClassAnalyzer } from "../../tsCompilerApi/tsClassAnalyzer.class";
import path from "path";
import { ClassRessource } from "../../tsCompilerApi/tsCompilerAPIRessourcees";

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
    const res: ClassRessource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "string",
        paramType: "basic",
      },
      optional: false,
    };
    expect(res[0].constructors[0].parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: number", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassNumber")]);
    const res: ClassRessource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "number",
        paramType: "basic",
      },
      optional: false,
    };
    expect(res[0].constructors[0].parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: boolean", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassBoolean")]);
    const res: ClassRessource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "boolean",
        paramType: "basic",
      },
      optional: false,
    };
    expect(res[0].constructors[0].parameters).toContainEqual(expectedParam);
  });
});

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> WEIRD", () => {
  test("erkenne Eingabeparameter: never", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassNever")]);
    const res: ClassRessource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "never",
        paramType: "never",
      },
      optional: false,
    };
    expect(res[0].constructors[0].parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: any", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassAny")]);
    const res: ClassRessource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "any",
        paramType: "any",
      },
      optional: false,
    };
    expect(res[0].constructors[0].parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: unknown", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassUnknown")]);
    const res: ClassRessource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "unknown",
        paramType: "unknown",
      },
      optional: false,
    };
    expect(res[0].constructors[0].parameters).toContainEqual(expectedParam);
  });
});
describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> ENUM", () => {
  test("erkenne Eingabeparameter: enum", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassEnum")]);
    const res: ClassRessource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        enumValues: ["RED", "BLUE", "YELLOW"],
        typeAsString: "myEnum",
        paramType: "enum",
      },
      optional: false,
    };
    expect(res[0].constructors[0].parameters).toContainEqual(expectedParam);
  });
});

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> ARRAY", () => {
  const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassArray")]);
  const res: ClassRessource[] = myAnalyser.parse();

  console.log(JSON.stringify(res, null, 2));
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
    expect(res[0].constructors[0].parameters[0]).toEqual(expectedParam);
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
    expect(res[0].constructors[0].parameters[1]).toEqual(expectedParam);
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
    expect(res[0].constructors[0].parameters[2]).toEqual(expectedParam);
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
    expect(res[0].constructors[0].parameters[3]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: array - object[]", () => {
    /*
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
    */

    //object not implemented jet
    expect(res[0].constructors[0].parameters[4]).toEqual("");
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
    expect(res[0].constructors[0].parameters[5]).toEqual(expectedParam);
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
    expect(res[0].constructors[0].parameters[6]).toEqual(expectedParam);
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

    expect(res[0].constructors[0].parameters[7]).toEqual(expectedParam);
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
    expect(res[0].constructors[0].parameters[8]).toEqual(expectedParam);
  });
});

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> UNION", () => {});

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> FUNC", () => {});

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> OBJECT", () => {});
