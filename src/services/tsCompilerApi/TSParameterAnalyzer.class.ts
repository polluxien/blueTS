import {
  ParameterDeclaration,
  Type,
  Node,
  Symbol,
  Signature,
  ts,
} from "ts-morph";

import {
  ParameterResource,
  TypeResource,
} from "../../_resources/tsCompilerAPIResources";

export class TSParameterAnalyzer {
  private MAX_DEPTH = 10;

  constructor(private param: ParameterDeclaration) {}

  //default param-analyser
  public paramAnalyzer(
    param: ParameterDeclaration = this.param
  ): ParameterResource {
    return {
      paramName: param.getName(),
      typeInfo: this.typeAnalyzer(param.getType()),
      optional: param.isOptional(),
    };
  }

  //type-analyser
  private typeAnalyzer(
    type: Type,
    depth: number = 0,
    visited = new Set<string>()
  ): TypeResource {
    let typeAsString;
    try {
      typeAsString = type.getText();
    } catch (err) {
      console.warn(`Type name could not be extracted`);
      typeAsString = "NOTYPE_NAME";
    }

    //zu großen Struckturen
    if (depth > this.MAX_DEPTH) {
      console.warn(`max depth reached for param ${typeAsString}`);
      return { typeAsString, paramType: "max-depth" };
    }

    //Rekursiver Schutz
    if (visited.has(typeAsString)) {
      console.warn(`rekursiv reference reached for param ${typeAsString}`);
      return { typeAsString, paramType: "recursive-reference" };
    }

    visited.add(typeAsString);
    const analyzedType = this.analyzeTypeSeperate(
      type,
      depth + 1,
      new Set(visited)
    );
    visited.delete(typeAsString);

    return analyzedType;
  }

  //untersuche Typen
  private analyzeTypeSeperate(
    type: Type,
    depth: number,
    visited: Set<string>
  ): TypeResource {
    const typeAsString = type.getText();

    //* special types
    if (["any", "unknown", "void", "never"].includes(typeAsString)) {
      return {
        typeAsString,
        paramType: typeAsString as "any" | "never" | "void" | "unknown",
      };
    }
    if (type.isNull()) {
      return { typeAsString, paramType: "null" };
    }
    if (type.isUndefined()) {
      return { typeAsString, paramType: "undefined" };
    }

    //* literal type
    if (type.isLiteral()) {
      return this.handelLiteralType(type, typeAsString);
    }

    //* enum type
    if (type.isEnum()) {
      return this.handelEnumType(type, typeAsString);
    }

    //* array type
    if (type.isArray()) {
      return {
        typeAsString,
        paramType: "array",
        arrayType: this.typeAnalyzer(
          type.getArrayElementTypeOrThrow(),
          depth,
          visited
        ),
      };
    }

    //* uion type
    // ! Problem bei union null und undefined werden raus gefiltert schon bei typeAsString und werden nicht als option gewertet
    if (type.isUnion() && !type.isBoolean()) {
      return this.handelUnionType(type, typeAsString, depth, visited);
    }

    //* intersection type
    if (type.isIntersection()) {
      return this.handleIntersectionType(type, typeAsString, depth, visited);
    }

    //* tupel type
    if (type.isTuple()) {
      this.handelTupelType(type, typeAsString, depth, visited);
    }

    //* function type
    if (type.getCallSignatures().length > 0) {
      return this.handleFunctionType(type, typeAsString, depth, visited);
    }

    //* instance type
    if (type.isClass()) {
      return {
        typeAsString,
        paramType: "instance",
      };
    }

    //* object type ( || interface)
    if (type.isObject()) {
      return this.handelObjectType(type, typeAsString, depth, visited);
    }

    //* primitiv -> basic type
    if (
      type.isString() ||
      type.isNumber() ||
      type.isBigInt() ||
      type.isBoolean()
    ) {
      return {
        typeAsString,
        paramType: "basic",
      };
    }

    //* generic type
    if (
      typeAsString.includes("<") &&
      typeAsString.includes(">") &&
      type.getTypeArguments().length > 0
    ) {
      return this.handleGenericType(type, typeAsString, depth, visited);
    }

    //* Fallback
    console.warn(`type was not recognized from param ${typeAsString}`);
    return {
      typeAsString,
      paramType: "unknown",
    };
  }
  handelTupelType(
    type: Type,
    typeAsString: string,
    depth: number,
    visited: Set<string>
  ) {
    const tupleElements = type.getTupleElements();
    const analyzedElements = tupleElements.map((t) =>
      this.typeAnalyzer(t, depth, visited)
    );

    // Check for rest elements by examining the original type string
    const hasRestElement = typeAsString.includes("...");

    // If has rest element, the last element should be treated as array
    if (hasRestElement && analyzedElements.length > 1) {
      const lastIndex = analyzedElements.length - 1;
      const lastElement = analyzedElements[lastIndex];

      // Convert the last element to array type if it's not already
      if (lastElement.paramType === "basic") {
        analyzedElements[lastIndex] = {
          typeAsString: `${lastElement.typeAsString}[]`,
          paramType: "array",
          arrayType: lastElement,
        };
      }
    }

    return {
      typeAsString,
      paramType: "tuple",
      tupleElements: analyzedElements,
      hasRestElement,
    };
  }

  handelUnionType(
    type: Type<ts.UnionType>,
    typeAsString: string,
    depth: number,
    visited: Set<string>
  ): TypeResource {
    const unionTypes = type.getUnionTypes();

    // Fallback für Boolean
    if (type.isBoolean()) {
      return { typeAsString: "boolean", paramType: "basic" };
    }

    const unionValues: TypeResource[] = [];
    const booleanLiterals: Type[] = [];

    for (const unionType of unionTypes) {
      const unionTypeText = unionType.getText();

      if (unionType.isNull()) {
        // ! Funktioniert nicht | erkennt in union kein null
        unionValues.push({ typeAsString: "null", paramType: "null" });
      } else if (unionType.isUndefined()) {
        // ! Funktioniert nicht | erkennt in union kein undefineds
        unionValues.push({ typeAsString: "undefined", paramType: "undefined" });
      }
      //bei type.getUnionTypes() werden boolean auch gespalten weil auch unionType
      //daher noch einmal schauen ob beide vorkommen und dann basic sonst einzelnt hinzufügen
      else if (
        unionType.isBooleanLiteral() &&
        (unionTypeText === "true" || unionTypeText === "false")
      ) {
        booleanLiterals.push(unionType);
      } else {
        unionValues.push(this.typeAnalyzer(unionType, depth, visited));
      }
    }

    //Boolean Literal Behandlung
    //Wenn beide Values true && false vorkommen pushe basic boolean
    if (booleanLiterals.length === 2) {
      unionValues.push({ typeAsString: "boolean", paramType: "basic" });
    } else if (booleanLiterals.length === 1) {
      const literalType = booleanLiterals[0];
      unionValues.push({
        typeAsString: literalType.getText(),
        paramType: "literal",
        literalType: "boolean",
      });
    }

    return {
      typeAsString,
      paramType: "union",
      unionValues,
    };
  }

  private handleIntersectionType(
    type: Type,
    typeAsString: string,
    depth: number,
    visited: Set<string>
  ): TypeResource {
    const intersectionTypes = type.getIntersectionTypes();
    const intersectionValues: TypeResource[] = [];

    for (const intersectionType of intersectionTypes) {
      intersectionValues.push(
        this.typeAnalyzer(intersectionType, depth, visited)
      );
    }

    return {
      typeAsString,
      paramType: "intersection",
      intersectionValues,
    };
  }

  private handelLiteralType(type: Type, typeAsString: string): TypeResource {
    let literalType = "";
    if (type.isStringLiteral()) {
      literalType = "string";
    } else if (type.isNumberLiteral()) {
      literalType = "number";
    } else if (type.isBigIntLiteral()) {
      literalType = "bigint";
    } else if (type.isBooleanLiteral()) {
      literalType = "boolean";
    }

    //switch typeAsString -> da bei literal value = type
    return {
      typeAsString,
      paramType: "literal",
      literalType: literalType,
    };
  }

  private handelEnumType(type: Type, typeAsString: string): TypeResource {
    try {
      const enumDecl = type.getSymbol()?.getDeclarations()?.[0];
      if (enumDecl && Node.isEnumDeclaration(enumDecl)) {
        const members = enumDecl.getMembers();
        const enumValues = members.map((m) => m.getName());
        return { typeAsString, paramType: "enum", enumValues };
      }
    } catch (err) {
      console.warn(`Error analyzing enum type ${typeAsString}: `, err);
    }

    return { typeAsString, paramType: "enum", enumValues: [] };
  }

  private handleFunctionType(
    type: Type,
    typeAsString: string,
    depth: number,
    visited: Set<string>
  ): TypeResource {
    const signatures = type.getCallSignatures();

    if (signatures.length === 0) {
      return {
        typeAsString,
        paramType: "function",
        functionRes: {
          defaultImplementation: "() => {}",
        },
      };
    }

    const signature = signatures[0];
    const paramCount = signature.getParameters().length;
    const returnType = signature.getReturnType();

    // Generiere Default-Implementation basierend auf Signatur
    let defaultImpl = "";

    if (paramCount === 0) {
      defaultImpl = returnType.isVoid() ? "() => {}" : "() => null";
    } else {
      const params = Array.from(
        { length: paramCount },
        (_, i) => `param${i}`
      ).join(", ");
      defaultImpl = returnType.isVoid()
        ? `(${params}) => {}`
        : `(${params}) => null`;
    }

    return {
      typeAsString,
      paramType: "function",
      functionRes: {
        defaultImplementation: defaultImpl,
        returnType: this.typeAnalyzer(returnType, depth, visited),
      },
    };
  }

  private handelObjectType(
    type: Type<ts.ObjectType>,
    typeAsString: string,
    depth: number,
    visited: Set<string>
  ): TypeResource {
    const props = type.getProperties();
    const paramArr: ParameterResource[] = [];

    //iterier durch alle Params/TypeProps von object
    for (let prop of props) {
      try {
        const propType = prop.getTypeAtLocation(this.param);
        paramArr.push({
          paramName: prop.getName(),
          typeInfo: this.typeAnalyzer(propType, depth, visited),
          optional: prop.isOptional?.() ?? false,
        });
      } catch (error) {
        console.warn(
          `Error analyzing object property ${prop.getName()}:`,
          error
        );
        paramArr.push({
          paramName: prop.getName(),
          typeInfo: { typeAsString: "unknown", paramType: "unknown" },
          optional: true,
        });
      }
    }

    return {
      typeAsString,
      paramType: "object",
      objectParameters: paramArr,
    };
  }

  private handleGenericType(
    type: Type,
    typeAsString: string,
    depth: number,
    visited: Set<string>
  ): TypeResource {
    const typeArgs = type.getTypeArguments();
    const baseType = typeAsString.split("<")[0] || typeAsString;

    // Promise und andere Builticht zu tief
    if (baseType === "Promise" || baseType === "Map" || baseType === "Set") {
      return {
        typeAsString,
        paramType: "generic",
        genericRes: {
          baseType,
          genericArgs: typeArgs
            .slice(0, 2)
            .map((arg) => this.typeAnalyzer(arg, depth, visited)),
        },
      };
    }

    // Für alle anderen Generics nur die Args analysieren
    if (typeArgs.length > 0) {
      return {
        typeAsString,
        paramType: "generic",
        genericRes: {
          baseType,
          genericArgs: typeArgs.map((arg) =>
            this.typeAnalyzer(arg, depth, visited)
          ),
        },
      };
    }

    return { typeAsString, paramType: "generic", genericRes: { baseType } };
  }
}
