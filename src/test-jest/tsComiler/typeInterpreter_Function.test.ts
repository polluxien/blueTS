import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/tsCompilerApi/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> FUNCTION", () => {
  const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassFunction"));
  const res: ClassResource[] = myAnalyser.parse();

  test("erkenne Eingabeparameter: () => void", () => {
    const expectedParam = {
      paramName: "simpleCallback",
      typeInfo: {
        typeAsString: "() => void",
        paramType: "function",
        functionSignature: {
          parameters: [],
          returnType: { typeAsString: "void", paramType: "void" },
        },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[0]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: (x: string) => number", () => {
    const expectedParam = {
      paramName: "transformFunction",
      typeInfo: {
        typeAsString: "(x: string) => number",
        paramType: "function",
        functionSignature: {
          parameters: [
            {
              paramName: "x",
              typeInfo: { typeAsString: "string", paramType: "basic" },
              optional: false,
            },
          ],
          returnType: { typeAsString: "number", paramType: "basic" },
        },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[1]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: (a: number, b: string, c?: boolean) => Promise<string>", () => {
    const expectedParam = {
      paramName: "complexAsyncFunction",
      typeInfo: {
        typeAsString: "(a: number, b: string, c?: boolean) => Promise<string>",
        paramType: "function",
        functionSignature: {
          parameters: [
            {
              paramName: "a",
              typeInfo: { typeAsString: "number", paramType: "basic" },
              optional: false,
            },
            {
              paramName: "b",
              typeInfo: { typeAsString: "string", paramType: "basic" },
              optional: false,
            },
            {
              paramName: "c",
              typeInfo: { typeAsString: "boolean", paramType: "basic" },
              optional: true,
            },
          ],
          returnType: {
            typeAsString: "Promise<string>",
            paramType: "generic",
            baseType: "Promise",
            genericArgs: [{ typeAsString: "string", paramType: "basic" }],
          },
        },
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[2]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: Function (generic function type)", () => {
    const expectedParam = {
      paramName: "genericFunction",
      typeInfo: {
        typeAsString: "Function",
        paramType: "function",
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters[3]).toEqual(expectedParam);
  });
});
