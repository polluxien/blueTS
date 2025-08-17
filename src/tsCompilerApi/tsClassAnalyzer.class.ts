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
          constructors: this.extractConstructors(cls),
          methods: this.extractMethodes(cls),
        };
        this.classResourceArr.push(myClass);
      }
    }
    return this.classResourceArr;
  }

  private extractConstructors(cls: ClassDeclaration): ConstructorResource[] {
    const constructorRessourceArr: ConstructorResource[] = [];

    /*
    //führe constructoren und constructSignautres zusammen
    const impl = cls.getConstructors()[0];
    
    const overloads = cls
      .getType()
      .getConstructSignatures()
      .filter((sig) => sig.getDeclaration() !== impl);
    const conArr = [impl, ...overloads];
    */

    for (let con of cls.getConstructors()) {
      const myConstructor: ConstructorResource = {
        parameters: this.extractParameters(con),
      };
      constructorRessourceArr.push(myConstructor);
    }

    return constructorRessourceArr;
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
      //Konstrucktor und bei überladen zusätzliche Signaturen
      | ConstructorDeclaration
      | Signature
  ): ParameterResource[] {
    const parameterRessourceArr: ParameterResource[] = [];
    //bei signatures, da getParams als symbol[] zurückgegeben wird
    /*
    if (foo instanceof Signature) {
      if (!foo.getDeclaration()) {
        return [];
      }

      for (let paramAsSymbol of foo.getParameters()) {
        console.log("PARAMSYMBOL FOUND -->", paramAsSymbol.getName());
        const myParameter = new TSParameterAnalyzer(paramAsSymbol, foo);
        parameterRessourceArr.push(myParameter.paramAnalyzer());
      }
    } else {
      */
    //bei Constructoren und Methoden
    for (let param of foo.getParameters()) {
      const myParameter = new TSParameterAnalyzer(param);
      parameterRessourceArr.push(myParameter.paramAnalyzer());
    }

    //  }
    return parameterRessourceArr;
  }
}
