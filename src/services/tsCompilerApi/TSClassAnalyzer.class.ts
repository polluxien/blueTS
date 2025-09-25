//Libarys
import {
  ClassDeclaration,
  ConstructorDeclaration,
  GetAccessorDeclaration,
  MethodDeclaration,
  Project,
  SetAccessorDeclaration,
  SyntaxKind,
  ts,
} from "ts-morph";

//eigene Imports
import { TsFileResource } from "../../_resources/FileResources";
import {
  ClassResource,
  MethodResource,
  ParameterResource,
  PropertyResource,
} from "../../_resources/tsCompilerAPIResources";

import { TSParameterAnalyzer } from "./TSParameterAnalyzer.class";

export class TSClassAnalyzer {
  private tsFile: TsFileResource;
  private project: Project;
  private classResourceArr: ClassResource[] = [];

  private program: ts.Program | undefined;

  constructor(tsFile: TsFileResource) {
    this.tsFile = tsFile;
    this.project = new Project();
  }

  public parse(): ClassResource[] {
    this.project.addSourceFileAtPath(this.tsFile.path);

    // * das ist vanilla ts compiler program
    this.program = this.project.getProgram().compilerObject;

    for (let sourceFile of this.project.getSourceFiles()) {
      for (let cls of sourceFile.getClasses()) {
        const myClass: ClassResource = {
          className: cls.getName()!,
          tsFile: this.tsFile,
          constructorParams:
            this.extractParameters(cls.getConstructors()[0]) ?? [],
          methods: this.extractMethodes(cls),
          properties: this.extractProperties(cls),
          specs: {
            extendsClass: cls.getExtends()?.getText(),
            implementsInterfaces:
              cls.getImplements().map((impl) => impl.getText()) ?? [],
          },
        };
        this.classResourceArr.push(myClass);
      }
    }
    return this.classResourceArr;
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

  private extractProperties(cls: ClassDeclaration): PropertyResource[] {
    const propertyResourceArr: PropertyResource[] = [];

    for (let prop of cls.getProperties()) {
      // Sichtbarkeit bestimmen
      let visibility: "public" | "private" | "protected" = "public";
      if (prop.hasModifier(SyntaxKind.PrivateKeyword)) {
        visibility = "private";
      } else if (prop.hasModifier(SyntaxKind.ProtectedKeyword)) {
        visibility = "protected";
      }

      const property: PropertyResource = {
        name: prop.getName(),
        type: prop.getType().getText(),
        specs: {
          visibility,
          isStatic: prop.isStatic(),
          isReadonly: prop.isReadonly(),
        },
      };

      propertyResourceArr.push(property);
    }

    return propertyResourceArr;
  }

  private extractParameters(
    foo: 
      //Methoden algemein, getter und setter
      | MethodDeclaration
      | GetAccessorDeclaration
      | SetAccessorDeclaration
      //Konstrucktor
      | ConstructorDeclaration
  ): ParameterResource[] {
    const parameterRessourceArr: ParameterResource[] = [];
    for (let param of foo.getParameters()) {
      const myParameter = new TSParameterAnalyzer(param, this.program!);
      parameterRessourceArr.push(myParameter.paramAnalyzer());
    }
    return parameterRessourceArr;
  }
}
