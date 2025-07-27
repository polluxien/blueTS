import {
  ClassDeclaration,
  ConstructorDeclaration,
  MethodDeclaration,
  Project,
} from "ts-morph";
import { TsFileResource } from "./fileService/fileResources";
import {
  ClassRessource,
  ConstructorRessource,
  MethodRessource,
  ParameterRessource,
  TypeRessource,
} from "./tsCompilerAPIRessourcees";
import path from "path";
import { PseudoBigInt } from "typescript";
import { TSParameterAnalyzer } from "./TSParameterAnalyzer.class";

export class TSClassAnalyzer {
  private tsFiles: TsFileResource[];
  private project: Project;
  private classRessourceArr: ClassRessource[] = [];

  constructor(tsFiles: TsFileResource[]) {
    this.tsFiles = tsFiles;
    this.project = new Project();
  }

  public parse(): ClassRessource[] {
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
        const myClass: ClassRessource = {
          className: cls.getName()!,
          tsFile: tsFile!,
          constructors: this.extractConstructors(cls),
          methods: this.extractMethodes(cls),
        };
        this.classRessourceArr.push(myClass);
      }
    }
    return this.classRessourceArr;
  }

  private extractConstructors(cls: ClassDeclaration): ConstructorRessource[] {
    const constructorRessourceArr: ConstructorRessource[] = [];
    for (let con of cls.getConstructors()) {
      const myConstructor: ConstructorRessource = {
        parameters: this.extractParameters(con),
      };
      constructorRessourceArr.push(myConstructor);
    }
    return constructorRessourceArr;
  }

  private extractMethodes(cls: ClassDeclaration): MethodRessource[] {
    const methodRessourceArr: MethodRessource[] = [];
    for (let met of cls.getMethods()) {
      const myMethod: MethodRessource = {
        methodName: met.getName(),
        parameters: this.extractParameters(met),
        returnType: met.getReturnType().getText(),
        isStatic: met.isStatic(),
      };
      methodRessourceArr.push(myMethod);
    }
    return methodRessourceArr;
  }

  private extractParameters(
    foo: MethodDeclaration | ConstructorDeclaration
  ): ParameterRessource[] {
    const parameterRessourceArr: ParameterRessource[] = [];
    for (let param of foo.getParameters()) {
      const myParameter = new TSParameterAnalyzer(param);
      parameterRessourceArr.push(myParameter.paramAnalyzer());
    }
    return parameterRessourceArr;
  }
}