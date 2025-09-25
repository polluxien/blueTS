import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/tsCompilerApi/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Error Handling und Edge Cases", () => {
  test("handle circular references", () => {
    const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassCircular"));
    const res: ClassResource[] = myAnalyser.parse();

    console.log(JSON);
    expect(JSON.stringify(res[0].constructorParams![0])).toContain(
      "recursive-reference"
    );
  });

  test("handle max depth reached", () => {
    const myAnalyser = new TSClassAnalyzer(
      giveMeTSResource("ClassDeepNested"),
    );
    const res: ClassResource[] = myAnalyser.parse();

    // Sollte nicht crashen und graceful fallback haben
    expect(res).toBeDefined();
    expect(res[0]).toBeDefined();
  });

  test("handle invalid TypeScript code", () => {
    const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassInvalid"));

    // Sollte nicht crashen
    expect(() => myAnalyser.parse()).not.toThrow();
  });
});
