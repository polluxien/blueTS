import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/analyseService/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> ARRAY", () => {
  const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassArray"));
  const res: ClassResource[] = myAnalyser.parse();

  test("erkenne Eingabeparameter: array - string[]", () => {
    const expectedParam = {
      paramName: "stringArray",
      typeInfo: {
        typeAsString: "string[]",
        paramType: "array",
        arrayType: {
          typeAsString: "string",
          paramType: "primitive-basic",
        },
      },
      isOptional: false,
    };
    expect(res[0].constructorParams[0]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: array - number[]", () => {
    const expectedParam = {
      paramName: "numberArray",
      typeInfo: {
        typeAsString: "number[]",
        paramType: "array",
        arrayType: {
          typeAsString: "number",
          paramType: "primitive-basic",
        },
      },
      isOptional: false,
    };
    expect(res[0].constructorParams[1]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: array - boolean[]", () => {
    const expectedParam = {
      paramName: "boolArray",
      typeInfo: {
        typeAsString: "boolean[]",
        paramType: "array",
        arrayType: {
          typeAsString: "boolean",
          paramType: "primitive-basic",
        },
      },
      isOptional: false,
    };
    expect(res[0].constructorParams[2]).toEqual(expectedParam);
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
            { typeAsString: "string", paramType: "primitive-basic" },
            { typeAsString: "number", paramType: "primitive-basic" },
          ],
        },
      },
      isOptional: false,
    };
    expect(res[0].constructorParams[3]).toEqual(expectedParam);
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
                paramType: "primitive-basic",
              },
              isOptional: false,
            },
            {
              paramName: "age",
              typeInfo: {
                typeAsString: "number",
                paramType: "primitive-basic",
              },
              isOptional: false,
            },
          ],
        },
      },
      isOptional: false,
    };

    //object not implemented jet
    expect(res[0].constructorParams[4]).toEqual(expectedParam);
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
          arrayType: { typeAsString: "string", paramType: "primitive-basic" },
        },
      },
      isOptional: false,
    };
    expect(res[0].constructorParams[5]).toEqual(expectedParam);
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
              paramType: "primitive-basic",
            },
            {
              typeAsString: "number",
              paramType: "primitive-basic",
            },
            {
              typeAsString: "boolean",
              paramType: "primitive-basic",
            },
          ],
        },
      },
      isOptional: false,
    };
    expect(res[0].constructorParams[6]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: genericArray -> Array<string>", () => {
    const expectedParam = {
      paramName: "genericArray",
      typeInfo: {
        typeAsString: "string[]",
        paramType: "array",
        arrayType: {
          typeAsString: "string",
          paramType: "primitive-basic",
        },
      },
      isOptional: false,
    };

    expect(res[0].constructorParams[7]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: read only Array -> readonly string[]", () => {
    const expectedParam = {
      paramName: "readonlyArray",
      typeInfo: {
        typeAsString: "readonly string[]",
        paramType: "array",
        arrayType: {
          typeAsString: "string",
          paramType: "primitive-basic",
        },
      },
      isOptional: false,
    };
    expect(res[0].constructorParams[8]).toEqual(expectedParam);
  });
});
