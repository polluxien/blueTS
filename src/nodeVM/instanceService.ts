import fs from "fs";
import ts from "typescript";
import { CreateClassInstanceRessource } from "./instanceManager";

const vm = require("vm");

export async function createClassVM(
  createClsInstanceRes: CreateClassInstanceRessource
): Promise<object> {
  try {
    //code einlesen
    const tsCode = fs.readFileSync(createClsInstanceRes.tsFile.path, {
      encoding: "utf8",
    });
    //code zu js kompilieren
    const transpiled = ts.transpileModule(tsCode, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    });
    const jsCode = transpiled.outputText;

    let context = {};
    vm.createContext(context);
    vm.runInContext(jsCode, context);

    const classConstructor = (context as any)[createClsInstanceRes.className];
    if (!classConstructor) {
      throw Error("Klasse in File nicht gefunden");
    }
    console.log("Constructor ausgabe: ", classConstructor);
    const myInstance = new classConstructor(
      ...(createClsInstanceRes.constructorParameter.length > 0
        ? createClsInstanceRes.constructorParameter
        : [])
    );

    return myInstance;
  } catch (err: any) {
    console.warn(err.message ? err.message : "Error: " + err);
    throw err;
  }
}

export async function compileClassMethod(
  classObj: object,
  methodName: string,
  parameter?: any[]
) {}
