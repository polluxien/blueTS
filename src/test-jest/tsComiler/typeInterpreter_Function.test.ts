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
      },
      optional: false,
    };
    expect(res[0].constructorParams![0]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: (x: string) => number", () => {
    const expectedParam = {
      paramName: "transformFunction",
      typeInfo: {
        typeAsString: "(x: string) => number",
        paramType: "function",
      },
      optional: false,
    };
    expect(res[0].constructorParams![1]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: (a: number, b: string, c?: boolean) => Promise<string>", () => {
    const expectedParam = {
      paramName: "complexAsyncFunction",
      typeInfo: {
        typeAsString: "(a: number, b: string, c?: boolean) => Promise<string>",
        paramType: "function",
      },
      optional: false,
    };
    expect(res[0].constructorParams![2]).toEqual(expectedParam);
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
    expect(res[0].constructorParams![3]).toEqual(expectedParam);
  });
});
