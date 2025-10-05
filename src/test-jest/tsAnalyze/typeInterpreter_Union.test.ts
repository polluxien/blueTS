import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/analyseService/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> UNION", () => {
  const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassUnion"));
  const res: ClassResource[] = myAnalyser.parse();

  console.log(res);

  test("erkenne Eingabeparameter: string | number", () => {
    const expectedParam = {
      paramName: "stringOrNumber",
      typeInfo: {
        typeAsString: "string | number",
        paramType: "union",
        unionValues: [
          { typeAsString: "string", paramType: "primitive-basic" },
          { typeAsString: "number", paramType: "primitive-basic" },
        ],
      },
      isOptional: false,
    };
    expect(res[0].constructorParams![0]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: number | boolean", () => {
    const expectedParam = {
      paramName: "numberOrBoolean",
      typeInfo: {
        typeAsString: "number | boolean",
        paramType: "union",
        unionValues: [
          { typeAsString: "number", paramType: "primitive-basic" },
          { typeAsString: "boolean", paramType: "primitive-basic" },
        ],
      },
      isOptional: false,
    };
    expect(res[0].constructorParams![1]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: string | string[]", () => {
    const expectedParam = {
      paramName: "stringOrArray",
      typeInfo: {
        typeAsString: "string | string[]",
        paramType: "union",
        unionValues: [
          { typeAsString: "string", paramType: "primitive-basic" },
          {
            typeAsString: "string[]",
            paramType: "array",
            arrayType: { typeAsString: "string", paramType: "primitive-basic" },
          },
        ],
      },
      isOptional: false,
    };
    expect(res[0].constructorParams![2]).toEqual(expectedParam);
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
            arrayType: { typeAsString: "string", paramType: "primitive-basic" },
          },
          {
            typeAsString: "[number, number]",
            paramType: "tuple",
            tupleElements: [
              { typeAsString: "number", paramType: "primitive-basic" },
              { typeAsString: "number", paramType: "primitive-basic" },
            ],
          },
        ],
      },
      isOptional: false,
    };
    console.log(JSON.stringify(res[0].constructorParams![3]));

    expect(res[0].constructorParams![3]).toEqual(expectedParam);
  });

    // ! erkennt kein null

  test("erkenne Eingabeparameter: { name: string } | null", () => {
    const expectedParam = {
      paramName: "objectOrNull",
      typeInfo: {
        typeAsString: "{ name: string; } | null",
        paramType: "union",
        unionValues: [
          { typeAsString: "null", paramType: "null" },
          {
            typeAsString: "{ name: string; }",
            paramType: "object",
            objectParameters: [
              {
                paramName: "name",
                typeInfo: {
                  typeAsString: "string",
                  paramType: "primitive-basic",
                },
                isOptional: false,
              },
            ],
          },
        ],
      },
      isOptional: false,
    };
    console.log(JSON.stringify(res[0].constructorParams![4]));

    expect(res[0].constructorParams![4]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: 'start' | 'stop' | boolean", () => {
    const expectedParam = {
      paramName: "unionLiteral",
      typeInfo: {
        typeAsString: 'boolean | "start" | "stop"',
        paramType: "union",
        unionValues: [
          {
            literalType: "string",
            typeAsString: '"start"',
            paramType: "literal",
          },
          {
            literalType: "string",
            typeAsString: '"stop"',
            paramType: "literal",
          },
          { typeAsString: "boolean", paramType: "primitive-basic" },
        ],
      },
      isOptional: false,
    };
    expect(res[0].constructorParams![5]).toEqual(expectedParam);
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
            paramType: "primitive-basic",
          },
          {
            typeAsString: "() => void",
            paramType: "function",
          },
        ],
      },
      isOptional: false,
    };
    expect(res[0].constructorParams![6]).toEqual(expectedParam);
  });

  // ! erkennt kein null oder undefined
  test("erkenne Eingabeparameter: string | number | boolean | null | undefined", () => {
    const expectedParam = {
      paramName: "complexUnion",
      typeInfo: {
        typeAsString: "string | number | boolean | null | undefined",
        paramType: "union",
        unionValues: [
          { typeAsString: "null", paramType: "null" },
          { typeAsString: "undefined", paramType: "undefined" },
          { typeAsString: "string", paramType: "primitive-basic" },
          { typeAsString: "number", paramType: "primitive-basic" },
          { typeAsString: "boolean", paramType: "primitive-basic" },
        ],
      },
      isOptional: false,
    };
    expect(res[0].constructorParams![7]).toEqual(expectedParam);
  });
});
