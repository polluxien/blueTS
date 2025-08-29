import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/tsCompilerApi/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> ENUM", () => {
  test("erkenne Eingabeparameter: enum", () => {
    const myAnalyser = new TSClassAnalyzer([giveMeTSResource("ClassEnum")]);
    const res: ClassResource[] = myAnalyser.parse();

    const expectedParam = {
      paramName: "x",
      typeInfo: {
        enumValues: ["RED", "BLUE", "YELLOW"],
        typeAsString: "myEnum",
        paramType: "enum",
      },
      optional: false,
    };
    expect(res[0].constructor!.parameters).toContainEqual(expectedParam);
  });
});

