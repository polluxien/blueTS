import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/tsCompilerApi/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> BASIC", () => {
  test("erkenne Eingabeparameter: string", () => {
    const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassString"));
    const res: ClassResource[] = myAnalyser.parse();

    console.log(res);

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "string",
        paramType: "primitive-basic",
      },
      isOptional: false,
    };
    expect(res[0].constructorParams!).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: number", () => {
    const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassNumber"));
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "number",
        paramType: "primitive-basic",
      },
      isOptional: false,
    };
    expect(res[0].constructorParams!).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: boolean", () => {
    const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassBoolean"));
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "boolean",
        paramType: "primitive-basic",
      },
      isOptional: false,
    };
    expect(res[0].constructorParams!).toContainEqual(expectedParam);
  });
});
