import fs from "fs";
import ts from "typescript";
import { CreateClassInstanceRessource } from "./instanceResources";
import { RunMethodeInInstanceType } from "./instanceManager";

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
      //fügt alle verfügbaren apis den context hinzu, nicht besonders sicher
      //...globalThis,

      //debugging
      console,

      //hole alle module
      exports: {},
      module: { exports: {} },
      require: require,

      //für async functions
      Promise: Promise,

      //für  Timer functions
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setInterval: setInterval,
      clearInterval: clearInterval,

      //global object
      global: {},
    };

    vm.createContext(context);
    vm.runInContext(jsCode, context, {
      timeout: 5000, // nach 5 Sekunden Timeout für code
    });

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
  instance: any,
  runMethodeInInstanceType: RunMethodeInInstanceType
): Promise<unknown> {
  const { methodName, params } = runMethodeInInstanceType;
  const { isAsync, methodKind } = runMethodeInInstanceType.specs;
  let result: unknown;

  try {
    if (methodKind === "set") {
      if (!params || params.length === 0) {
        throw new Error(`Setter '${methodName}' benötigt einen Parameter`);
      }

      //ich schaue noch nicht ob set exestiert
      instance[methodName] = params[0];
      return undefined;
    } else if (methodKind === "get") {
      if (params.length !== 0) {
        throw new Error(`Getter '${methodName}' benötigt keine Parameter`);
      }

      //ich schaue noch nicht ob get exestiert
      result = instance[methodName];
      return result;
    } else {
      const method = instance[methodName];

      if (!method) {
        throw new Error(`Methode '${methodName}' konnte nicht gefunden werden`);
      }

      if (typeof method !== "function") {
        throw new Error(`Methode '${methodName}' ist keine Funktion`);
      }

      result = isAsync
        ? await method.apply(instance, params)
        : method.apply(instance, params);
    }

    return result;
  } catch (err) {
    throw err;
  }
}
