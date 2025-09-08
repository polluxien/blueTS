import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/tsCompilerApi/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> WEIRD", () => {
  test("erkenne Eingabeparameter: never", () => {
    const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassNever"));
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "never",
        paramType: "never",
      },
      isOptional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: any", () => {
    const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassAny"));
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "any",
        paramType: "any",
      },
      isOptional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: unknown", () => {
    const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassUnknown"));
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "unknown",
        paramType: "unknown",
      },
      isOptional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: undefined", () => {
    const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassUndefined"));
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "undefined",
        paramType: "undefined",
      },
      isOptional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: null", () => {
    const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassNull"));
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        typeAsString: "null",
        paramType: "null",
      },
      isOptional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });
});
