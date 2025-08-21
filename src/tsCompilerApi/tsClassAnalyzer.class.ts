//Libarys
import {
  ClassDeclaration,
  ConstructorDeclaration,
  GetAccessorDeclaration,
  MethodDeclaration,
  Project,
  SetAccessorDeclaration,
  Signature,
  SignaturedDeclaration,
  SyntaxKind,
} from "ts-morph";
import path from "path";

//eigene Imports
import { TsFileResource } from "../_resources/fileResources";
import {
  ClassResource,
  ConstructorResource,
  MethodResource,
  ParameterResource,
} from "../_resources/tsCompilerAPIResources";
import { TSParameterAnalyzer } from "./TSParameterAnalyzer.class";

export class TSClassAnalyzer {
  private tsFiles: TsFileResource[];
  private project: Project;
  private classResourceArr: ClassResource[] = [];

  constructor(tsFiles: TsFileResource[]) {
    this.tsFiles = tsFiles;
    this.project = new Project();
  }

  public parse(): ClassResource[] {
    this.project.addSourceFilesAtPaths(this.tsFiles.map((f) => f.path));

    for (let sourceFile of this.project.getSourceFiles()) {
      for (let cls of sourceFile.getClasses()) {
        const tsFile = this.tsFiles.find(
          (file) =>
            path.normalize(file.path) ===
            path.normalize(sourceFile.getFilePath())
        );
        if (!tsFile) {
          console.warn(
            "File konnte nicht noch einmal gefunden werden: ",
            path.normalize(sourceFile.getFilePath())
          );
        }
        const myClass: ClassResource = {
          className: cls.getName()!,
          tsFile: tsFile!,
          constructor: this.extractConstructors(cls),
          methods: this.extractMethodes(cls),
        };
        this.classResourceArr.push(myClass);
      }
    }
    return this.classResourceArr;
  }

  private extractConstructors(
    cls: ClassDeclaration
  ): ConstructorResource | undefined {
    if (!cls.getConstructors()[0]) {
      return undefined;
    }
    const myConstructor: ConstructorResource = {
      //typescript klassisches überladen nicht möglich, nur mit signaturen

      parameters: this.extractParameters(cls.getConstructors()[0]),
    };

    return myConstructor;
  }

  private extractMethodes(cls: ClassDeclaration): MethodResource[] {
    const methodRessourceArr: MethodResource[] = [];

    let myMethod;
    for (let met of cls.getMethods()) {
      myMethod = this.methodRessourceBuilder(met, "default");
      methodRessourceArr.push(myMethod);
    }
    for (let met of cls.getGetAccessors()) {
      myMethod = this.methodRessourceBuilder(met, "get");
      methodRessourceArr.push(myMethod);
    }

    for (let met of cls.getSetAccessors()) {
      myMethod = this.methodRessourceBuilder(met, "set");
      methodRessourceArr.push(myMethod);
    }
    return methodRessourceArr;
  }

  private methodRessourceBuilder(
    met: MethodDeclaration | GetAccessorDeclaration | SetAccessorDeclaration,
    methodKind: "default" | "get" | "set"
  ): MethodResource {
    //Sichtbarkeit
    let visibility: "public" | "private" | "protected" = "public";
    if (met.hasModifier(SyntaxKind.PrivateKeyword)) {
      visibility = "private";
    } else if (met.hasModifier(SyntaxKind.ProtectedKeyword)) {
      visibility = "protected";
    }

    //get und set können nicht async sein
    //Async
    let isAsync = false;
    if (methodKind === "default") {
      isAsync = (met as MethodDeclaration).isAsync();
    }

    return {
      methodName: met.getName(),
      parameters: this.extractParameters(met),
      specs: {
        methodKind,
        visibility,
        isStatic: met.isStatic(),
        isAbstract: met.isAbstract(),
        isAsync,
      },
      returnType: met.getReturnType().getText(),
    };
  }

  private extractParameters(
    foo: //Methoden alg. u. getter und setter
    | MethodDeclaration
      | GetAccessorDeclaration
      | SetAccessorDeclaration
      //Konstrucktor
      | ConstructorDeclaration
  ): ParameterResource[] {
    const parameterRessourceArr: ParameterResource[] = [];
    for (let param of foo.getParameters()) {
      const myParameter = new TSParameterAnalyzer(param);
      parameterRessourceArr.push(myParameter.paramAnalyzer());
    }
    return parameterRessourceArr;
  }
}
