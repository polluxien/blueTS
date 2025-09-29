import path from "path";

import { Path } from "typescript";
import {
  addInstanceToInstanceMap,
  clearInstanceMap,
} from "../../services/nodeVM/instanceManager";
import { CompiledPropInstanceType } from "../../_resources/nodeVMResources";
import { CreateClassInstanceRequestType } from "../../_resources/request/objectRequest";
import { InstanceCheckResponseType } from "../../_resources/response/objectResponse";

describe("Erstelle eine Klasse und führe methoden richtig aus", () => {
  //hier sind die testrelevanten Props abgelegt
  let propsResultArr: CompiledPropInstanceType[];

  //erstelle zu anfang aller tests eine neue Instanz
  beforeAll(async () => {
    const myCreateClsInstanceRes: CreateClassInstanceRequestType = {
      instanceName: "testii",
      className: "AllTheTypes",
      tsFile: {
        name: `testClassMethods.ts`,
        path: path.resolve(
          __dirname,
          `../mockCode/nodeVM/ClassPropsTest.ts`
        ) as Path,
      },
      params: [],
    };
    const insCheck: InstanceCheckResponseType = await addInstanceToInstanceMap(
      myCreateClsInstanceRes
    );
    propsResultArr = insCheck.props!;
    console.log("Props ---->", propsResultArr.flat());
  });

  //lösche nach allen tests die instanz aus der map
  afterAll(() => {
    clearInstanceMap();
  });

  test("propsResultArr[0]: number", () => {
    expect(propsResultArr[0]).toBeDefined();
    expect(propsResultArr[0]).toEqual({
      name: "id",
      type: "number",
      value: "1",
    });
  });

  test("propsResultArr[1]: string", () => {
    expect(propsResultArr[1]).toBeDefined();
    expect(propsResultArr[1]).toEqual({
      name: "name",
      type: "string",
      value: "Bennet",
    });
  });

  test("propsResultArr[2]: boolean", () => {
    expect(propsResultArr[2]).toBeDefined();
    expect(propsResultArr[2]).toEqual({
      name: "isActive",
      type: "boolean",
      value: "true",
    });
  });

  test("propsResultArr[3]: null", () => {
    expect(propsResultArr[3]).toBeDefined();
    expect(propsResultArr[3]).toEqual({
      name: "rating",
      type: "null",
      value: "null",
    });
  });

  test("propsResultArr[4]: string (uuid)", () => {
    expect(propsResultArr[4]).toBeDefined();
    expect(propsResultArr[4]).toEqual({
      name: "uuid",
      type: "string",
      value: "123e4567-e89b-12d3-a456-426614174000",
    });
  });

  test("propsResultArr[5]: undefined", () => {
    expect(propsResultArr[5]).toBeDefined();
    expect(propsResultArr[5]).toEqual({
      name: "nothing",
      type: "undefined",
      value: undefined,
    });
  });

  test("propsResultArr[6]: any (object)", () => {
    expect(propsResultArr[6]).toBeDefined();
    expect(propsResultArr[6]).toEqual({
      name: "anything",
      type: "object",
      value: `{\"foo\":\"bar\"}`,
    });
  });

  test("propsResultArr[7]: unknown (number)", () => {
    expect(propsResultArr[7]).toBeDefined();
    expect(propsResultArr[7]).toEqual({
      name: "unknownThing",
      type: "number",
      value: "42",
    });
  });

  test("propsResultArr[8]: literal (string)", () => {
    expect(propsResultArr[8]).toBeDefined();
    expect(propsResultArr[8]).toEqual({
      name: "gender",
      type: "string",
      value: "male",
    });
  });

  test("propsResultArr[9]: literal union (string)", () => {
    expect(propsResultArr[9]).toBeDefined();
    expect(propsResultArr[9]).toEqual({
      name: "role",
      type: "string",
      value: "user",
    });
  });

  test("propsResultArr[10]: Date", () => {
    expect(propsResultArr[10]).toBeDefined();
    expect(propsResultArr[10]).toEqual({
      name: "birthDate",
      type: "object",
      value: "2000-01-01T00:00:00.000Z",
    });
  });

  test("propsResultArr[11]: object (address)", () => {
    expect(propsResultArr[11]).toBeDefined();
    expect(propsResultArr[11]).toEqual({
      name: "address",
      type: "object",
      value: `{\"street\":\"Musterstraße\",\"houseNumber\":12,\"postalCode\":\"12345\",\"city\":\"Berlin\"}`,
    });
  });

  test("propsResultArr[12]: string[]", () => {
    expect(propsResultArr[12]).toBeDefined();
    expect(propsResultArr[12]).toEqual({
      name: "tags",
      type: "array",
      value: `["example","test","sample"]`,
    });
  });

  test("propsResultArr[13]: number[]", () => {
    expect(propsResultArr[13]).toBeDefined();
    expect(propsResultArr[13]).toEqual({
      name: "scores",
      type: "array",
      value: `[10,20,30]`,
    });
  });

  test("propsResultArr[14]: tuple", () => {
    expect(propsResultArr[14]).toBeDefined();
    expect(propsResultArr[14]).toEqual({
      name: "mixedTuple",
      type: "array",
      value: `[\"Level\",5,true]`,
    });
  });
  test("propsResultArr[15]: Map", () => {
    expect(propsResultArr[15]).toBeDefined();
    expect(propsResultArr[15]).toEqual({
      name: "preferences",
      type: "object",
      value: '[["theme","dark"]]',
    });
  });

  test("propsResultArr[16]: Set", () => {
    expect(propsResultArr[16]).toBeDefined();
    expect(propsResultArr[16]).toEqual({
      name: "uniqueIds",
      type: "object",
      value: "[1,2,3]",
    });
  });

  test("propsResultArr[17]: function greet", () => {
    expect(propsResultArr[17]).toBeDefined();
    expect(propsResultArr[17]).toEqual({
      name: "greet",
      type: "function",
      value: 'function (n) { return "Hallo ".concat(n, "!"); }',
    });
  });

  test("propsResultArr[18]: function action", () => {
    expect(propsResultArr[18]).toBeDefined();
    expect(propsResultArr[18]).toEqual({
      name: "action",
      type: "function",
      value: 'function () { return console.log("Aktion ausgeführt"); }',
    });
  });

  test("propsResultArr[19]: genericValue", () => {
    expect(propsResultArr[19]).toBeDefined();
    expect(propsResultArr[19]).toEqual({
      name: "genericValue",
      type: "string",
      value: "defaultValue",
    });
  });

  // ! Stacic eigenschaften werden nicht erkannt
  test("propsResultArr[20]: genericValue", () => {
    expect(propsResultArr[20]).toBeDefined();
    expect(propsResultArr[20]).toEqual({
      name: "instanceCount",
      type: "number",
      value: 0,
    });
  });
});
