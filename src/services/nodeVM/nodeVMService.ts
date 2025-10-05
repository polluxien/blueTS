import fs from "fs";
import ts from "typescript";
import { CompiledPropInstanceType } from "../../_resources/nodeVMResources";
import {
  CompileErrorResource,
  TsCodeCheckResource,
} from "./checkTsCodeManager";
import { parseReturnResult } from "./nodeHelper";
import { normalizeParam } from "./typeCheckerHelper";
import {
  CreateClassInstanceRequestType,
  RunMethodInInstanceRequestType,
} from "../../_resources/request/objectRequest";
import { CompiledFunctionResponseTyp } from "../../_resources/response/functionResponse";
import { RunFunctionRequestType } from "../../_resources/request/functionRequest";

/**
 * https://nodejs.org/api/vm.html
 * node VM-Doku
 */
const vm = require("node:vm");

const restrictedRequire = (moduleName: string) => {
  const blockedModules = [
    "fs", // Datei
    "http", // Netzwerk
    "https", // Netzwerk
    "os", // Betriebssystem-Info
    "v8", // V8-Engine-Zugriff
    "vm", // VM-Modul selbst
  ];

  if (blockedModules.includes(moduleName)) {
    throw new Error(
      `Modul '${moduleName}' ist aus Sicherheitsgründen blockiert`
    );
  }
  return require(moduleName);
};

//für alle Operationen einheitliches collectedLogsArr
let collectedLogsArr: string[];

const setConsoleLogTxt = (logType: string, ...args: any[]) => {
  const txt = `${new Date().toLocaleTimeString()} • ${logType}: ${args.join(
    " "
  )}`;

  collectedLogsArr.push(txt);
};

//context für node-vm
// ? Module können nicht doppelt vorkommen im gleichen context
const createNewContext = () => {
  return {
    // fügt alle verfügbaren apis den context hinzu, nicht besonders sicher
    // ...globalThis,

    // ? logging
    /**
     * https://stackoverflow.com/questions/12805125/access-logs-from-console-log-in-node-js-vm-module
     * log, warn und error werden überschrieben innerhalb des vm-context
     */
    console: {
      log: (...args: any[]) => {
        setConsoleLogTxt("LOG", ...args);
      },
      warn: (...args: any[]) => setConsoleLogTxt("WARN", ...args),
      error: (...args: any[]) => setConsoleLogTxt("ERROR", ...args),
    },

    // ? hole alle module
    exports: {},
    module: { exports: {} },
    require: restrictedRequire,

    // ? für async functions
    Promise: Promise,

    // ? für  Timer functions
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,

    // ? global object ( {} = kein Zugriff auf Node.js global)
    global: {},
  };
};

function compileTS(filePath: string): string {
  const tsCode = fs.readFileSync(filePath, { encoding: "utf8" });
  return ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
}

function runInVM(jsCode: string, timeout = 5000) {
  collectedLogsArr = [];

  const context = createNewContext();
  vm.createContext(context);
  vm.runInContext(jsCode, context, { timeout });

  return context;
}

/**
 * es ist mir leider nicht möglich spezifische teile (KLassen, Funktionen, Module) zu testen
 * ganze Datei -> immer als einheit kompiliert
 */
export async function checkTsCode(
  filePath: string
): Promise<TsCodeCheckResource> {
  const errors: CompileErrorResource[] = [];

  try {
    const tsCode = fs.readFileSync(filePath, {
      encoding: "utf8",
    });

    // * Syntax check
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
         * finden von error mit Zeile und Spalte und hinzufügen zu errors
         */
        let errMessage = ts.flattenDiagnosticMessageText(err.messageText, "\n");
        let row, col;
        if (err.file && err.start && errMessage) {
          const { line, character } = err.file.getLineAndCharacterOfPosition(
            err.start
          );
          row = line + 1;
          col = character + 1;
        }
        errors.push({ message: errMessage, row, col });
      }
    }

    // * Laufzeit-Check
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

export async function createClassInstanceVM(
  createClsInstanceRes: CreateClassInstanceRequestType
): Promise<{ myInstance: object; collectedLogsArr: string[] }> {
  try {
    //transpiliere
    const jsCode = compileTS(createClsInstanceRes.tsFile.path);

    //erstelle context
    const runningContext = runInVM(jsCode);

    //finde und identifiziere KLasse
    const classConstructor = identifyClassOrFunction(
      runningContext,
      createClsInstanceRes.className
    );

    console.log("Constructor ausgabe: ", classConstructor);
    const myInstance = new classConstructor(
      ...(createClsInstanceRes.params.length > 0
        ? createClsInstanceRes.params
        : [])
    );

    return { myInstance, collectedLogsArr };
  } catch (err: any) {
    console.warn(err.message ? err.message : "Error: " + err);
    throw err;
  }
}

export async function extractClassInstanceProps(
  instance: any
): Promise<CompiledPropInstanceType[]> {
  let propTypeArr: CompiledPropInstanceType[] = [];

  try {
    // Hole alle props der Instanz
    const instanceProps = Object.getOwnPropertyNames(instance) ?? [];

    for (let propName of instanceProps) {
      try {
        let value: any;
        let type: string;

        // get prop value
        try {
          if (propName in instance) {
            value = instance[propName];
          } else {
            // Falls Property nur im Prototyp existiert
            value = Object.getPrototypeOf(instance)[propName];
          }
        } catch (err) {
          value = "[not inspected]";
        }

        // Bestimme Typ
        // das funktioniert nur sehr oberflächlich nach transpilierung

        if (typeof value === "function") {
          type = "function";
        } else if (value === null) {
          type = "null";
        } else if (Array.isArray(value)) {
          type = "array";
        } else {
          type = typeof value;
        }

        propTypeArr.push({
          name: propName,
          type: type,
          value: parseReturnResult(value),
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

export async function compileInstanceMethod(
  instance: any,
  runMethodeInInstanceType: RunMethodInInstanceRequestType
): Promise<{ result: unknown; collectedLogsArr: string[] }> {
  collectedLogsArr = [];

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
      return { result: undefined, collectedLogsArr };
    } else if (methodKind === "get") {
      if (params.length !== 0) {
        throw new Error(`Getter '${methodName}' benötigt keine Parameter`);
      }

      //ich schaue noch nicht ob get exestiert
      result = instance[methodName];
      return { result, collectedLogsArr };
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

    return { result, collectedLogsArr };
  } catch (err) {
    throw err;
  }
}

export async function compileFunction(
  runFunctionType: RunFunctionRequestType
): Promise<CompiledFunctionResponseTyp> {
  // params parsen wenn nötig
  runFunctionType.params = runFunctionType.params.flatMap(normalizeParam);

  const { functionName, params } = runFunctionType;
  const { isAsync } = runFunctionType.specs;
  let result: unknown;

  try {
    //transpiliere
    const jsCode = compileTS(runFunctionType.tsFile.path);

    //erstelle context
    const runningContext = runInVM(jsCode);

    const func = identifyClassOrFunction(runningContext, functionName);

    if (!func) {
      throw new Error(
        `Function '${functionName}' konnte nicht gefunden werden`
      );
    }

    if (typeof func !== "function") {
      throw new Error(`function '${functionName}' ist keine Funktion`);
    }

    result = isAsync ? await func(...params) : func(...params);

    return {
      functionName,
      isValid: true,
      returnValue: parseReturnResult(result),
      tsFile: runFunctionType.tsFile,
      ...(collectedLogsArr.length > 0 && { logs: collectedLogsArr }),
    };
  } catch (err) {
    return {
      functionName,
      isValid: false,
      error: err instanceof Error ? err.message : String(err),
      tsFile: runFunctionType.tsFile,
      ...(collectedLogsArr.length > 0 && { logs: collectedLogsArr }),
    };
  }
}

function identifyClassOrFunction(context: any, modulName: string) {
  //Klasse/Function von typ function da js sie so wertet

  //nicht exportierte Klassen/Function
  if (context[modulName] && typeof context[modulName] === "function") {
    return context[modulName];
  }

  //exportierte Klassen/Function
  if (
    context.exports &&
    context.exports[modulName] &&
    typeof context.exports[modulName] === "function"
  ) {
    return context.exports[modulName];
  }

  //Default-Export prüfen
  if (
    context.exports &&
    typeof context.exports.default === "function" &&
    (modulName === "default" || !modulName)
  ) {
    return context.exports.default;
  }

  throw new Error(`Klasse oder Funktion '${modulName}' im File nicht gefunden`);
}
