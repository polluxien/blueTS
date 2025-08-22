import fs from "fs";
import ts from "typescript";
import {
  CreateClassInstanceRessource,
  RunMethodeInInstanceType,
} from "../_resources/nodeVMResources";
import { CompileErrorResource, TsCodeCheckResource } from "./checkTsCodeManager";

const vm = require("node:vm");

//context für node-vm
// ? Module können nicht doppelt vorkommen im gleichen context
function createNewContext() {
  return {
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
}

export async function checkTsCode(
  filePath: string
): Promise<TsCodeCheckResource> {
  const errors: CompileErrorResource[] = [];

  try {
    const tsCode = fs.readFileSync(filePath, {
      encoding: "utf8",
    });

    /**
     * es ist mir leider nicht möglich spezifische teile (KLassen, Funktionen, Module) zu testen
     * ganze Datei -> immer als einheit kompiliert
     */
    // Syntaxcheck
    const transpiled = ts.transpileModule(tsCode, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
      reportDiagnostics: true,
    });

    if (transpiled.diagnostics && transpiled.diagnostics.length > 0) {
      for (let err of transpiled.diagnostics) {
        /**
         * https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API/38206fde051e37bcf0cb11a29068a1e9f9cc8a14
         * füge bei finden von error zu errors hinzu
         */
        let errMessage = ts.flattenDiagnosticMessageText(err.messageText, "\n");
        let row, col;
        if (err.file && err.start && errMessage) {
          const { line, character } = err.file.getLineAndCharacterOfPosition(
            err.start
          );
          row = line;
          col = character;
        }
        errors.push({ message: errMessage, row, col });
      }
    }

    // Laufzeit-Check
    try {
      const script = new vm.Script(transpiled.outputText, {
        filePath: filePath,
      });
      script.runInNewContext(createNewContext());
    } catch (runtimeErr: any) {
      errors.push(runtimeErr.message || String(runtimeErr));
    }

    return { isValid: errors.length === 0, errors: errors };
  } catch (err: any) {
    return { isValid: false, errors: err.message || String(err) };
  }
}

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

    const context = createNewContext();
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

//checke ob der kompilierte code koreckt ist
export type verifyContext = {
  context: string;
  isValid: boolean;
  error?: Error;
};
export async function runContext() {}

//liefe alle props von instance zurück
export type InstancePropsType = {
  instanceName: string;
  classNAme: string;
  props: PropType[];
};

export type PropType = {
  name: string;
  type: string;
  value?: string;
  specs?: {
    visibility: "public" | "private" | "protected";
    isStatic: boolean;
  };
};

export async function extractClassInstanceProps(
  instance: any
): Promise<PropType[]> {
  let propTypeArr: PropType[] = [];

  try {
    // Hole alle props der Instanz
    const propNames = Object.getOwnPropertyNames(instance);
    for (let propName of propNames) {
      try {
        let value: any;
        let type: string;

        // ! visabilility wird nicht richtgig erkannt
        /*
        let visibility: "public" | "private" | "protected" = "public";

        // Bestimme Sichtbarkeit anhand des Namens
        if (propName.startsWith("_")) {
          visibility = propName.startsWith("__") ? "private" : "protected";
        } else if (instance[propName]) {
        }
        */

        // get prop value
        try {
          if (propName in instance) {
            value = instance[propName];
          } else {
            // Falls Property nur im Prototyp existiert
            value = Object.getPrototypeOf(instance)[propName];
          }
        } catch (err) {
          value = "[Nicht zugreifbar]";
        }

        // Bestimme Typ
        if (typeof value === "function") {
          type = "function";
        } else if (value === null) {
          type = "null";
        } else if (Array.isArray(value)) {
          type = "array";
        } else {
          type = typeof value;
        }

        // Konvertiere Wert zu String
        let valueStr: string;
        try {
          if (typeof value === "function") {
            valueStr = `[Function: ${propName}]`;
          } else if (typeof value === "object" && value !== null) {
            valueStr =
              JSON.stringify(value, null, 2).substring(0, 100) +
              (JSON.stringify(value).length > 100 ? "..." : "");
          } else if (typeof value === "string") {
            valueStr = `"${String(value)}"`;
          } else {
            valueStr = String(value);
          }
        } catch (err) {
          valueStr = "[Nicht serialisierbar]";
        }

        propTypeArr.push({
          name: propName,
          type,
          value: valueStr,
          /*
          specs: {
            visibility,
            isStatic,
          },
          */
        });
      } catch {
        propTypeArr.push({ name: propName, type: "unknown" });
      }
    }
  } catch (err: any) {
    throw new Error("Fehler beim Extrahieren der Properties: ", err.message);
  }
  return propTypeArr;
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
