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

    const context: any = {
      //debugging
      console,

      //hole alle module
      exports: {},
      module: { exports: {} },
      require: require,

      //setzte automatischen Timout nach 3 sekunden
      setTimeout: 3000,
    };
    vm.createContext(context);
    vm.runInContext(jsCode, context);

    //finde und identifiziere KLasse
    const classConstructor = identifyClass(
      context,
      createClsInstanceRes.className
    );

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

function identifyClass(context: any, className: string) {
  //Klasse von typ function da js sie so wertet

  //nicht exportierte Klasse
  if (context[className] && typeof context[className] === "function") {
    return context[className];
  }

  //exportierte Klassen
  if (
    context.exports &&
    context.exports[className] &&
    typeof context.exports[className] === "function"
  ) {
    return context.exports[className];
  }

  throw Error("Klasse in File nicht gefunden");
}

export async function compileClassMethod(
  classObj: object,
  methodName: string,
  parameter?: any[]
) {}
