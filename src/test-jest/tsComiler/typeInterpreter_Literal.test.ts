import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/tsCompilerApi/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> LITERAL", () => {
  const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassLiteral"));
  const res: ClassResource[] = myAnalyser.parse();

  test("erkenne Eingabeparameter: 'hello' (string literal)", () => {
    const expectedParam = {
      paramName: "stringLiteral",
      typeInfo: {
        typeAsString: '"hello"',
        paramType: "literal",
        literalType: "string",
      },
      isOptional: false,
    };
    expect(res[0].constructor!.parameters[0]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: 42 (number literal)", () => {
    const expectedParam = {
      paramName: "numberLiteral",
      typeInfo: {
        typeAsString: "42",
        paramType: "literal",
        literalType: "number",
      },
      isOptional: false,
    };
    expect(res[0].constructor!.parameters[1]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: true (boolean literal)", () => {
    const expectedParam = {
      paramName: "booleanLiteral",
      typeInfo: {
        typeAsString: "true",
        paramType: "literal",
        literalType: "boolean",
      },
      isOptional: false,
    };
    expect(res[0].constructor!.parameters[2]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: 123n (bigint literal)", () => {
    const expectedParam = {
      paramName: "bigintLiteral",
      typeInfo: {
        typeAsString: "123n",
        paramType: "literal",
        literalType: "bigint",
      },
      isOptional: false,
    };
    expect(res[0].constructor!.parameters[3]).toEqual(expectedParam);
  });
});