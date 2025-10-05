import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/analyseService/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> OBJECT", () => {
  const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassObject"));
  const res: ClassResource[] = myAnalyser.parse();

  test("erkenne Eingabeparameter: { name: string; age: number }", () => {
    const expectedParam = {
      paramName: "simpleObject",
      typeInfo: {
        typeAsString: "{ name: string; age: number; }",
        paramType: "object",
        objectParameters: [
          {
            paramName: "name",
            typeInfo: { typeAsString: "string", paramType: "primitive-basic" },
            isOptional: false,
          },
          {
            paramName: "age",
            typeInfo: { typeAsString: "number", paramType: "primitive-basic" },
            isOptional: false,
          },
        ],
      },
      isOptional: false,
    };
    expect(res[0].constructorParams![0]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: { name: string; age?: number; tags: string[] }", () => {
    const expectedParam = {
      paramName: "complexObject",
      typeInfo: {
        typeAsString: "{ name: string; age?: number; tags: string[]; }",
        paramType: "object",
        objectParameters: [
          {
            paramName: "name",
            typeInfo: { typeAsString: "string", paramType: "primitive-basic" },
            isOptional: false,
          },
          {
            paramName: "age",
            typeInfo: { typeAsString: "number", paramType: "primitive-basic" },
            isOptional: true,
          },
          {
            paramName: "tags",
            typeInfo: {
              typeAsString: "string[]",
              paramType: "array",
              arrayType: { typeAsString: "string", paramType: "primitive-basic" },
            },
            isOptional: false,
          },
        ],
      },
      isOptional: false,
    };
    expect(res[0].constructorParams![1]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: nested object", () => {
    const expectedParam = {
      paramName: "nestedObject",
      typeInfo: {
        typeAsString:
          "{ user: { name: string; email: string; }; settings: { theme: string; }; }",
        paramType: "object",
        objectParameters: [
          {
            paramName: "user",
            typeInfo: {
              typeAsString: "{ name: string; email: string; }",
              paramType: "object",
              objectParameters: [
                {
                  paramName: "name",
                  typeInfo: { typeAsString: "string", paramType: "primitive-basic" },
                  isOptional: false,
                },
                {
                  paramName: "email",
                  typeInfo: { typeAsString: "string", paramType: "primitive-basic" },
                  isOptional: false,
                },
              ],
            },
            isOptional: false,
          },
          {
            paramName: "settings",
            typeInfo: {
              typeAsString: "{ theme: string; }",
              paramType: "object",
              objectParameters: [
                {
                  paramName: "theme",
                  typeInfo: { typeAsString: "string", paramType: "primitive-basic" },
                  isOptional: false,
                },
              ],
            },
            isOptional: false,
          },
        ],
      },
      isOptional: false,
    };
    expect(res[0].constructorParams![2]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: Record<string, any>", () => {
    const expectedParam = {
      paramName: "recordType",
      typeInfo: {
        typeAsString: "Record<string, any>",
        paramType: "generic",
        genericRes: {
          baseType: "Record",
          genericArgs: [
            { typeAsString: "string", paramType: "primitive-basic" },
            { typeAsString: "any", paramType: "special" },
          ],
        },
      },
      isOptional: false,
    };
    expect(res[0].constructorParams![3]).toEqual(expectedParam);
  });
});
