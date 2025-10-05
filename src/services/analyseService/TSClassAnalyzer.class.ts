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

/**
 * Analysiert TypeScript-Klassen mit ts-morph und extrahiert deren Metadaten.
 * Erfasst Konstruktor, Methoden, Properties und deren Spezifikationen.
 */
export class TSClassAnalyzer {
  private tsFile: TsFileResource;
  private project: Project;
  private classResourceArr: ClassResource[] = [];

  private program: ts.Program | undefined;

  constructor(tsFile: TsFileResource) {
    this.tsFile = tsFile;
    this.project = new Project();
  }

  /**
   + Parst alle Klassen in der Datei und gibt ClassResource-Array zurück
   */
  public parse(): ClassResource[] {
    this.project.addSourceFileAtPath(this.tsFile.path);

    // * das ist vanilla ts compiler program
    this.program = this.project.getProgram().compilerObject;

    for (let sourceFile of this.project.getSourceFiles()) {
      for (let cls of sourceFile.getClasses()) {
        const clsConstructor = cls.getConstructors()[0];

        const myClass: ClassResource = {
          className: cls.getName()!,
          tsFile: this.tsFile,
          constructorParams: clsConstructor
            ? this.extractParameters(
                cls.getConstructors()[0],
                cls.getName()!,
                "constructor"
              )
            : [],
          methods: this.extractMethodes(cls),
          properties: this.extractProperties(cls),
          specs: {
            // ! für Protyp ersteinaml herausgenommen -> Fehleranfällig
            extendsClass: undefined, //cls.getExtends()?.getText(),
            implementsInterfaces: [],
            //cls.getImplements().map((impl) => impl.getText()) ?? [],
          },
        };
        this.classResourceArr.push(myClass);
      }
    }
    return this.classResourceArr;
  }

  /**
   + holt alle Methoden default, getter und setter einer Klasse
   */
  private extractMethodes(cls: ClassDeclaration): MethodResource[] {
    const clsName = cls.getName()!;

    const methodRessourceArr: MethodResource[] = [];

    let myMethod;
    for (let met of cls.getMethods()) {
      myMethod = this.methodRessourceBuilder(met, "default", clsName);
      methodRessourceArr.push(myMethod);
    }
    for (let met of cls.getGetAccessors()) {
      myMethod = this.methodRessourceBuilder(met, "get", clsName);
      methodRessourceArr.push(myMethod);
    }

    for (let met of cls.getSetAccessors()) {
      myMethod = this.methodRessourceBuilder(met, "set", clsName);
      methodRessourceArr.push(myMethod);
    }
    return methodRessourceArr;
  }

  /**
   * extrahiere Methoden-Metadaten und gebe MethodResource zurück
   */
  private methodRessourceBuilder(
    met: MethodDeclaration | GetAccessorDeclaration | SetAccessorDeclaration,
    methodKind: "default" | "get" | "set",
    clsName: string
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

    const methodName = met.getName();
    return {
      methodName,
      parameters: this.extractParameters(met, clsName, methodName),
      methodKind,
      isAsync,
      specs: {
        visibility,
        isStatic: met.isStatic(),
        isAbstract: met.isAbstract(),
      },
      returnType: met.getReturnType().getText(),
    };
  }

  /**
   * Extrahiert alle Properties einer Klasse in PropertyResourcen
   */
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

  /**
   * Extrahiert Auruf-Parameter von Methoden/Konstruktoren über TSParameterAnalyzer
   */
  private extractParameters(
    foo: //Methoden algemein, getter und setter
    | MethodDeclaration
      | GetAccessorDeclaration
      | SetAccessorDeclaration
      //Konstrucktor
      | ConstructorDeclaration,
    clsName: string,
    sigName: string
  ): ParameterResource[] {
    const parameterRessourceArr: ParameterResource[] = [];
    try {
      for (let param of foo.getParameters()) {
        const myParameter = new TSParameterAnalyzer(param, this.program!);
        parameterRessourceArr.push(myParameter.paramAnalyzer());
      }
    } catch (err) {
      console.warn(
        `Error bei Parameteranalye von Klasse ${clsName} at signature of ${sigName}`
      );
    }
    return parameterRessourceArr;
  }
}
