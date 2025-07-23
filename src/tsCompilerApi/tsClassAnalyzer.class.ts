import {
  ClassDeclaration,
  ConstructorDeclaration,
  MethodDeclaration,
  Project,
  Type,
} from "ts-morph";
import { TsFileResource } from "./fileService/fileResources";
import {
  ClassRessource,
  ConstructorRessource,
  MethodRessource,
  ParameterRessource,
} from "./tsCompilerAPIRessourcees";
import path from "path";

export class TSClassAnalyzer {
  private tsFiles: TsFileResource[];
  private project: Project;
  private classRessourceArr: ClassRessource[] = [];

  constructor(tsFiles: TsFileResource[]) {
    this.tsFiles = tsFiles;
    this.project = new Project();
  }

  public parse(): ClassRessource[] {
    this.tsFiles.map((file) => this.project.addSourceFilesAtPaths(file.path));

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
          methodes: this.extractMethodes(cls),
        };
        this.classRessourceArr.push(myClass);
      }
    }
    return this.classRessourceArr;
  }

  private extractConstructors(
    cls: ClassDeclaration
  ): ConstructorRessource[] | undefined {
    const constructorRessourceArr: ConstructorRessource[] = [];
    for (let con of cls.getConstructors()) {
      const myConstructor: ConstructorRessource = {
        parameters: this.extractParameters(con),
      };
      constructorRessourceArr.push(myConstructor);
    }
    return constructorRessourceArr;
  }

  private extractMethodes(
    cls: ClassDeclaration
  ): MethodRessource[] | undefined {
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
      const myParameter: ParameterRessource = {
        paramName: param.getName(),
        type: param.getType(),
        typeAsString: param.getType().getText(),
        optional: param.isOptional(),
      };
    }
    return parameterRessourceArr;
  }
}
