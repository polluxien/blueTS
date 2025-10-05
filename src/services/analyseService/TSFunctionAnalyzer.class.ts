//Libarys
import {
  ArrowFunction,
  FunctionDeclaration,
  FunctionExpression,
  Project,
  ts,
} from "ts-morph";
import path from "path";

//eigene Imports
import { TsFileResource } from "../../_resources/FileResources";
import {
  FunctionResource,
  ParameterResource,
} from "../../_resources/tsCompilerAPIResources";
import { TSParameterAnalyzer } from "./TSParameterAnalyzer.class";

/**
 * Analysiert TypeScript-Funktionen mit ts-morph und extrahiert deren Metadaten.
 * Unterstützt Function Declarations, Arrow Functions und Function Expressions.
 */
export class TSFunctionAnalyzer {
  private tsFile: TsFileResource;
  private getAllFunctionTypex: boolean;
  private project: Project;
  private functionResourceArr: FunctionResource[] = [];

  private program: ts.Program | undefined;

  constructor(tsFile: TsFileResource, getAllFunctionTypex: boolean = true) {
    this.tsFile = tsFile;
    this.getAllFunctionTypex = getAllFunctionTypex;
    this.project = new Project();
  }

  /**
   + Parst alle Funktione in der Datei und gibt FunctionResource-Array zurück
   */
  public parse(): FunctionResource[] {
    this.project.addSourceFilesAtPaths(this.tsFile.path);

    // * das ist vanilla ts compiler program
    this.program = this.project.getProgram().compilerObject;

    for (let sourceFile of this.project.getSourceFiles()) {
      //für klassische Functions
      for (let foo of sourceFile.getFunctions()) {
        const myFunction = this.extractFunction(foo, this.tsFile);
        this.functionResourceArr.push(myFunction);
      }
      //für Arrow-Functions und Function-Expression
      if (this.getAllFunctionTypex) {
        for (const variable of sourceFile.getVariableDeclarations()) {
          const initializer = variable.getInitializer();
          if (
            initializer instanceof ArrowFunction ||
            initializer instanceof FunctionExpression
          ) {
            const myFunction = this.extractFunction(
              initializer,
              this.tsFile,
              variable.getName()
            );
            this.functionResourceArr.push(myFunction);
          }
        }
      }
    }
    return this.functionResourceArr;
  }

  /**
   * holt alle Funktionen (FunctionDeclaration | FunctionExpression | ArrowFunction) einer Datei
   */
  private extractFunction(
    foo: FunctionDeclaration | FunctionExpression | ArrowFunction,
    tsFile: TsFileResource,
    varName?: string
  ): FunctionResource {
    const myFunction: FunctionResource = {
      functionName:
        (foo instanceof ArrowFunction || foo instanceof FunctionExpression
          ? varName
          : foo.getName()) || "undefined",
      tsFile,
      parameters: this.extractParameters(foo),
      specs: this.extractFunctionSpecs(foo),
      isAsync: foo.isAsync(),
      returnType: foo.getReturnType().getText(),
    };
    return myFunction;
  }

  /**
   * Extrahiere alle Eingabe-Parameter für Funktionsaufruf
   */
  private extractParameters(
    foo: FunctionDeclaration | FunctionExpression | ArrowFunction
  ): ParameterResource[] {
    const parameterRessourceArr: ParameterResource[] = [];
    for (let param of foo.getParameters()) {
      const myParameter = new TSParameterAnalyzer(param, this.program!);
      parameterRessourceArr.push(myParameter.paramAnalyzer());
    }
    return parameterRessourceArr;
  }

  /**
   * extrahiere zusätztliche MetaDAten aus Funktionssignatur für specs-Objekt
   */
  private extractFunctionSpecs(
    foo: FunctionDeclaration | FunctionExpression | ArrowFunction
  ) {
    //ermittlung function type
    let functionType:
      | "function-declaration"
      | "arrow-function"
      | "function-expression"
      | "generator-function" = "function-declaration";

    if (foo instanceof FunctionExpression) {
      functionType = "function-expression";
    } else if (foo instanceof ArrowFunction) {
      functionType = "arrow-function";
    } else if (foo.isGenerator()) {
      functionType = "generator-function";
    }

    let isDefault = false;
    let isExported = false;
    if (
      !(foo instanceof ArrowFunction) &&
      !(foo instanceof FunctionExpression)
    ) {
      isDefault = foo.isDefaultExport();
      isExported = foo.isExported();
    }

    return { isDefault, isExported, functionType };
  }
}
