import path from "path";
import { ClassResource } from "../../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "../../services/tsCompilerApi/TSClassAnalyzer.class";
import { Path } from "typescript";

describe("Interpretiere alle Klassen Eigenschaften korrekt -> Properties", () => {
  const myAnalyser = new TSClassAnalyzer({
    name: `Employee.ts`,
    path: path.resolve(
      __dirname,
      `../mockCode/tsCompiler/propAttributes/Employee.ts`
    ) as Path,
  });
  const res: ClassResource[] = myAnalyser.parse();

  test("erkenne Property: 'name' (public string)", () => {
    const expectedParam = {
      name: "name",
      type: "string",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[0]).toEqual(expectedParam);
  });

  test("erkenne Property: 'age' (public number)", () => {
    const expectedParam = {
      name: "age",
      type: "number",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[1]).toEqual(expectedParam);
  });

  test("erkenne Property: 'isActive' (public boolean)", () => {
    const expectedParam = {
      name: "isActive",
      type: "boolean",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[2]).toEqual(expectedParam);
  });

  test("erkenne Property: '_salary' (private number)", () => {
    const expectedParam = {
      name: "_salary",
      type: "number",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "private",
      },
    };
    expect(res[0].properties[3]).toEqual(expectedParam);
  });

  test("erkenne Property: '_employeeId' (private readonly string)", () => {
    const expectedParam = {
      name: "_employeeId",
      type: "string",
      specs: {
        isReadonly: true,
        isStatic: false,
        visibility: "private",
      },
    };
    expect(res[0].properties[4]).toEqual(expectedParam);
  });

  test("erkenne Property: '_credentials' (private optional Map)", () => {
    const expectedParam = {
      name: "_credentials",
      type: "Map<string, string>",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "private",
      },
    };
    expect(res[0].properties[5]).toEqual(expectedParam);
  });

  test("erkenne Property: 'department' (protected string)", () => {
    const expectedParam = {
      name: "department",
      type: "string",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "protected",
      },
    };
    expect(res[0].properties[6]).toEqual(expectedParam);
  });

  test("erkenne Property: 'COMPANY_NAME' (static readonly string)", () => {
    const expectedParam = {
      name: "COMPANY_NAME",
      type: "string",
      specs: {
        isReadonly: true,
        isStatic: true,
        visibility: "public",
      },
    };
    expect(res[0].properties[7]).toEqual(expectedParam);
  });

  test("erkenne Property: 'employeeCount' (static number)", () => {
    const expectedParam = {
      name: "employeeCount",
      type: "number",
      specs: {
        isReadonly: false,
        isStatic: true,
        visibility: "public",
      },
    };
    expect(res[0].properties[8]).toEqual(expectedParam);
  });

  test("erkenne Property: '_nextEmployeeId' (private static number)", () => {
    const expectedParam = {
      name: "_nextEmployeeId",
      type: "number",
      specs: {
        isReadonly: false,
        isStatic: true,
        visibility: "private",
      },
    };
    expect(res[0].properties[9]).toEqual(expectedParam);
  });

  test("erkenne Property: 'email' (optional string)", () => {
    const expectedParam = {
      name: "email",
      type: "string",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[10]).toEqual(expectedParam);
  });

  test("erkenne Property: 'phoneNumber' (optional string)", () => {
    const expectedParam = {
      name: "phoneNumber",
      type: "string",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[11]).toEqual(expectedParam);
  });

  test("erkenne Property: 'middleName' (optional string)", () => {
    const expectedParam = {
      name: "middleName",
      type: "string",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[12]).toEqual(expectedParam);
  });

  test("erkenne Property: 'skills' (string array)", () => {
    const expectedParam = {
      name: "skills",
      type: "string[]",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[13]).toEqual(expectedParam);
  });

  test("erkenne Property: 'projects' (Set<string>)", () => {
    const expectedParam = {
      name: "projects",
      type: "Set<string>",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[14]).toEqual(expectedParam);
  });

  test("erkenne Property: 'metadata' (Record<string, any>)", () => {
    const expectedParam = {
      name: "metadata",
      type: "Record<string, any>",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[15]).toEqual(expectedParam);
  });

  test("erkenne Property: 'address' (optional object type)", () => {
    const expectedParam = {
      name: "address",
      type: "{ street: string; city: string; zipCode: string; country?: string; }",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[16]).toEqual(expectedParam);
  });

  test("erkenne Property: 'contractType' (union type)", () => {
    const expectedParam = {
      name: "contractType",
      type: '"permanent" | "temporary" | "freelance"',
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[17]).toEqual(expectedParam);
  });

  test("erkenne Property: 'workLocation' (optional union type)", () => {
    const expectedParam = {
      name: "workLocation",
      type: '"office" | "remote" | "hybrid"',
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[18]).toEqual(expectedParam);
  });

  test("erkenne Property: 'taskHistory' (generic array)", () => {
    const expectedParam = {
      name: "taskHistory",
      type: "{ id: string; title: string; completed: boolean; dueDate?: Date; }[]",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[19]).toEqual(expectedParam);
  });

  test("erkenne Property: 'onStatusChange' (optional function)", () => {
    const expectedParam = {
      name: "onStatusChange",
      type: "(oldStatus: boolean, newStatus: boolean) => void",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[20]).toEqual(expectedParam);
  });

  test("erkenne Property: 'validator' (function)", () => {
    const expectedParam = {
      name: "validator",
      type: "(value: any) => boolean",
      specs: {
        isReadonly: false,
        isStatic: false,
        visibility: "public",
      },
    };
    expect(res[0].properties[21]).toEqual(expectedParam);
  });
});