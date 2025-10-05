import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/analyseService/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> ENUM", () => {
  test("erkenne Eingabeparameter: enum", () => {
    const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassEnum"));
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        enumMembers: ["RED", "BLUE", "YELLOW"],
        typeAsString: "myEnum",
        paramType: "enum",
      },
      isOptional: false,
    };
    expect(res[0].constructorParams!).toContainEqual(expectedParam);
  });
});

