import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/analyseService/TSClassAnalyzer.class";
import { giveMeTSResource } from "../testHelper";

describe("Interpretiere alle Eingabeparameter bei Klassen korrekt -> INTERSECTION", () => {
  const myAnalyser = new TSClassAnalyzer(
    giveMeTSResource("ClassIntersection"),
  );
  const res: ClassResource[] = myAnalyser.parse();

  test("erkenne Eingabeparameter: User & { id: string }", () => {
    // ? Interface wird hier als object erkannt was ziemlich genial ist um ehrlich zu sein

    const expectedParam = {
      paramName: "userWithId",
      typeInfo: {
        typeAsString: "User & { id: string; }",
        paramType: "intersection",
        intersectionValues: [
          {
            typeAsString: "User",
            paramType: "object",
            objectParameters: [
              {
                isOptional: false,
                paramName: "name",
                typeInfo: {
                  paramType: "primitive-basic",
                  typeAsString: "string",
                },
              },
              {
                isOptional: false,
                paramName: "email",
                typeInfo: {
                  paramType: "primitive-basic",
                  typeAsString: "string",
                },
              },
            ],
          },
          {
            typeAsString: "{ id: string; }",
            paramType: "object",
            objectParameters: [
              {
                paramName: "id",
                typeInfo: { typeAsString: "string", paramType: "primitive-basic" },
                isOptional: false,
              },
            ],
          },
        ],
      },
      isOptional: false,
    };
    expect(res[0].constructorParams![0]).toEqual(expectedParam);
  });

  test("erkenne Eingabeparameter: { name: string } & { age: number } & { email: string }", () => {
    const expectedParam = {
      paramName: "multipleIntersection",
      typeInfo: {
        typeAsString:
          "{ name: string; } & { age: number; } & { email: string; }",
        paramType: "intersection",
        intersectionValues: [
          {
            typeAsString: "{ name: string; }",
            paramType: "object",
            objectParameters: [
              {
                paramName: "name",
                typeInfo: { typeAsString: "string", paramType: "primitive-basic" },
                isOptional: false,
              },
            ],
          },
          {
            typeAsString: "{ age: number; }",
            paramType: "object",
            objectParameters: [
              {
                paramName: "age",
                typeInfo: { typeAsString: "number", paramType: "primitive-basic" },
                isOptional: false,
              },
            ],
          },
          {
            typeAsString: "{ email: string; }",
            paramType: "object",
            objectParameters: [
              {
                paramName: "email",
                typeInfo: { typeAsString: "string", paramType: "primitive-basic" },
                isOptional: false,
              },
            ],
          },
        ],
      },
      isOptional: false,
    };
    expect(res[0].constructorParams![1]).toEqual(expectedParam);
  });
});
