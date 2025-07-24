import {
  ClassDeclaration,
  ConstructorDeclaration,
  MethodDeclaration,
  Node,
  ParameterDeclaration,
  Project,
  Type,
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

export class TSParameterAnalyzer {
  private curParamAsString: string | undefined;

  constructor(private param: ParameterDeclaration) {}

  private parseType(param: ParameterDeclaration): string {
    const typeNode = param.getTypeNode();
    return typeNode ? typeNode.getText() : param.getType().getText();
  }

  //default param-analyser
  public paramAnalyzer(
    param: ParameterDeclaration = this.param
  ): ParameterRessource {
    this.curParamAsString = this.parseType(param);
    return {
      paramName: param.getName(),
      typeInfo: this.typeAnalyzer(param.getType()),
      optional: param.isOptional(),
    };
  }

  private isBasicType(type: Type): boolean {
    return type.isString() || type.isNumber() || type.isBoolean();
  }

  //default type-analyser (eine Ebene Tiefer)
  private typeAnalyzer(type: Type): TypeRessource {
    const typeAsString = this.curParamAsString!;

    if (type.isUnion()) {
      return {
        typeAsString,
        paramType: "union",
        unionValues: type
          .getUnionTypes()
          .map((union) => this.typeAnalyzer(union)),
      };
    }

    if (type.isTuple()) {
      return {
        typeAsString,
        paramType: "tuple",
        tupleElements: type.getTupleElements().map((t) => this.typeAnalyzer(t)),
      };
    }

    if (type.isArray()) {
      return {
        typeAsString,
        paramType: "array",
        arrayType: this.typeAnalyzer(type.getArrayElementTypeOrThrow()),
      };
    }

    if (type.isEnum()) {
      const enumDecl = type.getSymbol()?.getDeclarations()?.[0];
      if (enumDecl && Node.isEnumDeclaration(enumDecl)) {
        const members = enumDecl.getMembers();
        const enumValues = members.map((m) => m.getName());
        return { typeAsString, paramType: "enum", enumValues };
      }
    }

    // ! Unvollständig muss noch fertig implementiert werden
    if (type.isObject()) {
      const props = type.getProperties();
      //const fields = props.map((prop) => this.paramAnalyzer(prop));

      return {
        typeAsString,
        paramType: "object",
        // objectParameters: fields,
      };
    }

    // ! functional und litral hier noch implementieren

    if (this.isBasicType(type)) {
      return {
        typeAsString,
        paramType: "basic",
      };
    }

    if (typeAsString === "any") {
      return { typeAsString, paramType: "any" };
    }
    if (typeAsString === "unknown") {
      return { typeAsString, paramType: "unknown" };
    }
    if (typeAsString === "never") {
      return { typeAsString, paramType: "never" };
    }
    if (typeAsString === "void") {
      return { typeAsString, paramType: "void" };
    }

    //default Fallback
    return {
      typeAsString,
      paramType: "unknown",
    };
  }
}
