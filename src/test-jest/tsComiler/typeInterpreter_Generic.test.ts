import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/tsCompilerApi/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> GENERIC", () => {
  const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassGeneric"));
  const res: ClassResource[] = myAnalyser.parse();

  test("erkenne Eingabeparameter: Array<string>", () => {
    const expectedParam = {
      paramName: "genericArray",
      typeInfo: {
        typeAsString: "string[]", 
        paramType: "array",
        arrayType: { typeAsString: "string", paramType: "basic" },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[0]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: Promise<number>", () => {
    const expectedParam = {
      paramName: "promiseNumber",
      typeInfo: {
        typeAsString: "Promise<number>",
        paramType: "generic",
        genericRes: {
          baseType: "Promise",
          genericArgs: [{ typeAsString: "number", paramType: "basic" }],
        },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[1]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: Map<string, number>", () => {
    const expectedParam = {
      paramName: "stringToNumberMap",
      typeInfo: {
        typeAsString: "Map<string, number>",
        paramType: "generic",
        genericRes: {
          baseType: "Map",
          genericArgs: [
            { typeAsString: "string", paramType: "basic" },
            { typeAsString: "number", paramType: "basic" },
          ],
        },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[2]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: Set<User> (mit custom type)", () => {
    const expectedParam = {
      paramName: "userSet",
      typeInfo: {
        typeAsString: "Set<User>",
        paramType: "generic",
        genericRes: {
          baseType: "Set",
          genericArgs: [{ typeAsString: "User", paramType: "instance" }],
        },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[3]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: Promise<Array<string>>", () => {
    const expectedParam = {
      paramName: "nestedGeneric",
      typeInfo: {
        typeAsString: "Promise<string[]>",
        paramType: "generic",
        baseType: "Promise",
        genericArgs: [
          {
            typeAsString: "string[]",
            paramType: "array",
            arrayType: { typeAsString: "string", paramType: "basic" },
          },
        ],
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[4]).toEqual(expectedParam);
  });
});