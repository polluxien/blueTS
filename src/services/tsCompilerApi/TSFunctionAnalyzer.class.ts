//Libarys
import {
  ArrowFunction,
  FunctionDeclaration,
  FunctionExpression,
  Project,
} from "ts-morph";
import path from "path";

//eigene Imports
import { TsFileResource } from "../../_resources/fileResources";
import {
  FunctionResource,
  ParameterResource,
} from "../../_resources/tsCompilerAPIResources";
import { TSParameterAnalyzer } from "./TSParameterAnalyzer.class";

export class TSFunctionAnalyzer {
  private tsFiles: TsFileResource[];
  private getAllFunctionTypex: boolean;
  private project: Project;
  private functionResourceArr: FunctionResource[] = [];

  constructor(tsFiles: TsFileResource[], getAllFunctionTypex: boolean = false) {
    this.tsFiles = tsFiles;
    this.getAllFunctionTypex = getAllFunctionTypex;
    this.project = new Project();
  }

  public parse(): FunctionResource[] {
    this.project.addSourceFilesAtPaths(this.tsFiles.map((f) => f.path));

    for (let sourceFile of this.project.getSourceFiles()) {
      const tsFile = this.tsFiles.find(
        (file) =>
          path.normalize(file.path) === path.normalize(sourceFile.getFilePath())
      );
      if (!tsFile) {
        console.warn(
          "File konnte nicht noch einmal gefunden werden: ",
          path.normalize(sourceFile.getFilePath())
        );
        continue;
      }

      //für klassische Functions
      for (let foo of sourceFile.getFunctions()) {
        const myFunction = this.extractFunction(foo, tsFile!);
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
              tsFile!,
              variable.getName()
            );
            this.functionResourceArr.push(myFunction);
          }
        }
      }
    }
    return this.functionResourceArr;
  }

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
      returnType: foo.getReturnType().getText(),
    };
    return myFunction;
  }

  private extractParameters(
    foo: FunctionDeclaration | FunctionExpression | ArrowFunction
  ): ParameterResource[] {
    const parameterRessourceArr: ParameterResource[] = [];
    for (let param of foo.getParameters()) {
      const myParameter = new TSParameterAnalyzer(param);
      parameterRessourceArr.push(myParameter.paramAnalyzer());
    }
    return parameterRessourceArr;
  }

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
    const isAsync = foo.isAsync();

    return { isDefault, isExported, isAsync, functionType };
  }
}
