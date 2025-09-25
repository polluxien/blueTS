import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/tsCompilerApi/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> TUPLE", () => {
  const myAnalyser = new TSClassAnalyzer(giveMeTSResource("ClassTuple"));
  const res: ClassResource[] = myAnalyser.parse();

  test("erkenne Eingabeparameter: [string, number]", () => {
    const expectedParam = {
      paramName: "simpleTuple",
      typeInfo: {
        typeAsString: "[string, number]",
        paramType: "tuple",
        tupleElements: [
          { typeAsString: "string", paramType: "primitive-basic" },
          { typeAsString: "number", paramType: "primitive-basic" },
        ],
      },
      isOptional: false,
    };
    expect(res[0].constructorParams![0]).toEqual(expectedParam);
  });

  // ! erkennt keine optional types
  test("erkenne Eingabeparameter: [string, number, boolean?]", () => {
    const expectedParam = {
      paramName: "optionalTuple",
      typeInfo: {
        typeAsString: "[string, number, boolean?]",
        paramType: "tuple",
        tupleElements: [
          { typeAsString: "string", paramType: "primitive-basic" },
          { typeAsString: "number", paramType: "primitive-basic" },
          {
            typeAsString: "boolean",
            paramType: "primitive-basic",
            isOptional: true,
          },
        ],
      },
      isOptional: false,
    };
    console.log(JSON.stringify(res[0].constructorParams![1]), null, 2);

    expect(res[0].constructorParams![1]).toEqual(expectedParam);
  });

  // ! erkennt keine rest types
  test("erkenne Eingabeparameter: [string, ...number[]]", () => {
    const expectedParam = {
      paramName: "restTuple",
      typeInfo: {
        typeAsString: "[string, ...number[]]",
        paramType: "tuple",
        tupleElements: [
          { typeAsString: "string", paramType: "primitive-basic" },
          {
            typeAsString: "number",
            paramType: "primitive-basic",
            isRest: true,
          },
        ],
      },
      isOptional: false,
    };
    console.log(JSON.stringify(res[0].constructorParams![2]), null, 2);
    expect(res[0].constructorParams![2]).toEqual(expectedParam);
  });
});
