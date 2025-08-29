import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/tsCompilerApi/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> TUPLE", () => {
  const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassTuple")]);
  const res: ClassResource[] = myAnalyser.parse();

  test("erkenne Eingabeparameter: [string, number]", () => {
    const expectedParam = {
      paramName: "simpleTuple",
      typeInfo: {
        typeAsString: "[string, number]",
        paramType: "tuple",
        tupleElements: [
          { typeAsString: "string", paramType: "basic" },
          { typeAsString: "number", paramType: "basic" },
        ],
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[0]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: [string, number, boolean?]", () => {
    const expectedParam = {
      paramName: "optionalTuple",
      typeInfo: {
        typeAsString: "[string, number, (boolean | undefined)?]",
        paramType: "tuple",
        tupleElements: [
          { typeAsString: "string", paramType: "basic" },
          { typeAsString: "number", paramType: "basic" },
          {
            typeAsString: "boolean | undefined",
            paramType: "union",
            unionValues: [
              { typeAsString: "boolean", paramType: "basic" },
              { typeAsString: "undefined", paramType: "undefined" },
            ],
          },
        ],
      },
      optional: false,
    };
    console.log(JSON.stringify(res[0].constructor!.parameters[1]), null, 2);

    expect(res[0].constructor!.parameters[1]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: [string, ...number[]]", () => {
    const expectedParam = {
      paramName: "restTuple",
      typeInfo: {
        typeAsString: "[string, ...number[]]",
        paramType: "tuple",
        tupleElements: [
          { typeAsString: "string", paramType: "basic" },
          {
            typeAsString: "number[]",
            paramType: "array",
            arrayType: { typeAsString: "number", paramType: "basic" },
          },
        ],
        hasRestElement: true,
      },
      optional: false,
    };
    console.log(JSON.stringify(res[0].constructor!.parameters[2]), null, 2);
    expect(res[0].constructor!.parameters[2]).toEqual(expectedParam);
  });
});

// ERROR HANDLING TESTS
describe("Error Handling und Edge Cases", () => {
  test("handle circular references", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassCircular")]);
    const res: ClassResource[] = myAnalyser.parse();

    expect(res[0].constructor!.parameters[0].typeInfo.paramType).toBe(
      "circular-reference"
    );
  });

  test("handle max depth reached", () => {
    const myAnalyser = new TSClassAnalyzer([
      giveMeTSResource("ClassDeepNested"),
    ]);
    const res: ClassResource[] = myAnalyser.parse();

    // Sollte nicht crashen und graceful fallback haben
    expect(res).toBeDefined();
    expect(res[0]).toBeDefined();
  });

  test("handle invalid TypeScript code", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassInvalid")]);

    // Sollte nicht crashen
    expect(() => myAnalyser.parse()).not.toThrow();
  });
});
