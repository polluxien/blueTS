import { ParameterDeclaration, Type, Node, ts } from "ts-morph";

import {
  ParameterResource,
  TypeResource,
} from "../../_resources/tsCompilerAPIResources";
import { UnionType } from "typescript";

export class TSParameterAnalyzer {
  private MAX_DEPTH = 10;

  private checker;

  constructor(private param: ParameterDeclaration, program: ts.Program) {
    this.checker = program.getTypeChecker();
  }

  //default param-analyser
  public paramAnalyzer(
    param: ParameterDeclaration = this.param
  ): ParameterResource {
    //hier wieder in vanilla typescript ast auflösen
    const compilerNode = param.compilerNode as ts.ParameterDeclaration;
    const isOptional = !!compilerNode.questionToken;

    return {
      paramName: param.getName(),
      typeInfo: this.typeAnalyzer(param.getType()),
      isOptional: isOptional,

      //nur setzten wenn rest == true
      ...(param.isRestParameter() && { isRest: true }),
    };
  }

  private getTsTypeFromTsMorphType(tsMorphType: Type): ts.Type {
    const symbol = tsMorphType.getSymbol();
    if (symbol) {
      return this.checker!.getTypeOfSymbolAtLocation(
        symbol.compilerSymbol,
        this.param.compilerNode
      );
    }

    // Fallback
    return this.checker!.getTypeAtLocation(this.param.compilerNode);
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
      typeAsString = "NO_TYPE_NAME";
    }

    //zu großen Struckturen
    if (depth > this.MAX_DEPTH) {
      console.warn(`max depth reached for param ${typeAsString}`);
      return {
        typeAsString,
        paramType: "fallback",
        errorWarning: "max depth for type struct reached",
      };
    }

    //Rekursiver Schutz
    if (visited.has(typeAsString)) {
      console.warn(`rekursiv reference reached for param ${typeAsString}`);
      return {
        typeAsString,
        paramType: "fallback",
        errorWarning: "type has recursive-reference",
      };
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

    // nativ api vars
    const tsType = this.getTsTypeFromTsMorphType(type);
    const flags = type.getFlags();

    //* special-locked
    if (["void", "never"].includes(typeAsString)) {
      return {
        typeAsString,
        paramType: "special-locked",
      };
    }

    //* special
    if (typeAsString === "any" || type.isUndefined()) {
      return {
        typeAsString,
        paramType: "special",
      };
    }
    // * primitive-special-types
    if (["symbol", "unknown"].includes(typeAsString) || type.isNull()) {
      return { typeAsString, paramType: "primitive-special" };
    }

    //* enum type
    if (type.isEnum()) {
      return this.handelEnumType(type as Type<ts.EnumType>, typeAsString);
    }

    // ? ts nativ api - compiler api ----------------------------------------------------------------------------
    // Handle null and undefined --> Fallback
    if ((flags & ts.TypeFlags.Null) !== 0) {
      return { typeAsString: "null", paramType: "special-locked" };
    }
    if ((flags & ts.TypeFlags.Undefined) !== 0) {
      return { typeAsString: "undefined", paramType: "special" };
    }

    // Union types - gibt fehler bei ts-morph version daher verwendung von nativ
    if ((flags & ts.TypeFlags.Union) !== 0 && !type.isBoolean()) {
      return this.handleUnionType(type, tsType, typeAsString, depth, visited);
    }

    // ? ----------------------------------------------------------------------------------------------------------

    //* literal type
    if (type.isLiteral()) {
      return this.handelLiteralType(type as Type<ts.LiteralType>, typeAsString);
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

    // ! könnte man noch seperat behandeln momentan interface als object
    if (type.isInterface()) {
    }

    //* intersection type
    if (type.isIntersection()) {
      return this.handleIntersectionType(type, typeAsString, depth, visited);
    }

    //* tupel type
    if (type.isTuple()) {
      return this.handelTupelType(type, typeAsString, depth, visited);
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

    //* generic type
    if (
      typeAsString.includes("<") &&
      typeAsString.includes(">") &&
      type.getTypeArguments().length > 0
    ) {
      return this.handleGenericType(
        type as Type<ts.GenericType>,
        typeAsString,
        depth,
        visited
      );
    }

    //* object type ( || interface)
    // quasi Fallback, nimmt sehr viel
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
        paramType: "primitive-basic",
      };
    }

    //* Fallback
    console.warn(`type was not recognized from param ${typeAsString}`);
    return {
      typeAsString,
      paramType: "fallback",
      errorWarning:
        "param type was not recognized or is currenttly not supportet",
    };
  }

  private handelTupelType(
    type: Type<ts.TupleType>,
    typeAsString: string,
    depth: number,
    visited: Set<string>
  ): TypeResource {
    // ? funktioniert nur auf oberster Ebene
    const getTupleKind = (elementIndex: number) => {
      return this.param
        .getTypeNode()
        ?.asKind(ts.SyntaxKind.TupleType)
        ?.getElements()
        [elementIndex]?.getKind();
    };

    const isTupleElementOptional = (elementIndex: number) => {
      return getTupleKind(elementIndex) === ts.SyntaxKind.OptionalType;
    };

    const isTupelElementRest = (elementIndex: number) => {
      return getTupleKind(elementIndex) === ts.SyntaxKind.RestType;
    };

    return {
      typeAsString,
      paramType: "tuple",
      /*
      tupleElements: type.getTupleElements().map((elementType, index) => {
        return this.typeAnalyzer(elementType, depth, visited);
      }),
      */

      tupleElements: type.getTupleElements().map((elementType, index) => {
        const analyzed = this.typeAnalyzer(elementType, depth + 1, visited);

        const isOptional = depth === 1 && isTupleElementOptional(index);
        const isRest = depth === 1 && isTupelElementRest(index);

        return {
          ...analyzed,
          ...(isOptional && { isOptional: true }),
          ...(isRest && { isRest: true }),
        };
      }),
    };
  }

  // ! sowohl nativ ts compiler api noch ts-morph erkennen ---> | undefined | null
  private handleUnionType(
    tsMorphType: Type,
    nativeType: ts.Type,
    typeAsString: string,
    depth: number,
    visited: Set<string>
  ): TypeResource {
    if (tsMorphType.isBoolean()) {
      return { typeAsString: "boolean", paramType: "primitive-basic" };
    }

    // Use native TS API to get union types - more reliable
    const unionTsNativTypes = (nativeType as ts.UnionType).types;
    const unionValues: TypeResource[] = [];
    const booleanLiterals: Type[] = [];

    let hasNull = false;
    let hasUndefined = false;

    try {
      for (const unionMember of unionTsNativTypes) {
        const flags = unionMember.getFlags();

        if ((flags & ts.TypeFlags.Null) !== 0) {
          hasNull = true;
          unionValues.push({
            typeAsString: "null",
            paramType: "special-locked",
          });
        } else if ((flags & ts.TypeFlags.Undefined) !== 0) {
          hasUndefined = true;
          unionValues.push({
            typeAsString: "undefined",
            paramType: "special",
          });
        }
      }
    } catch (err) {
      console.error(err);
    }

    const unionTypes = tsMorphType.getUnionTypes();

    for (const unionType of unionTypes) {
      const unionTypeText = unionType.getText();

      if (unionType.isNull() || unionType.isUndefined()) {
        // * Funktioniert eh nicht | erkennt in union kein null oder undefined
        // just to be sure
        continue;
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

    // Handle boolean literals
    //Boolean Literal Behandlung
    //Wenn beide Values true && false vorkommen pushe basic boolean
    if (booleanLiterals.length === 2) {
      unionValues.push({
        typeAsString: "boolean",
        paramType: "primitive-basic",
      });
    } else if (booleanLiterals.length === 1) {
      const literalType = booleanLiterals[0];
      unionValues.push({
        typeAsString: literalType.getText(),
        paramType: "literal",
        literalType: "boolean",
      });
    }
    if (hasNull) {
      typeAsString += " | null";
    }
    if (hasUndefined) {
      typeAsString += " | undefined";
    }

    return {
      typeAsString,
      paramType: "union",
      unionValues,
    };
  }

  private handleIntersectionType(
    type: Type<ts.IntersectionType>,
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

  private handelLiteralType(
    type: Type<ts.LiteralType>,
    typeAsString: string
  ): TypeResource {
    let literalType = "";
    if (type.isStringLiteral() || type.isTemplateLiteral()) {
      literalType = "string";
    } else if (type.isNumberLiteral()) {
      literalType = "number";
    } else if (type.isBigIntLiteral()) {
      literalType = "bigint";
    } else if (type.isBooleanLiteral()) {
      literalType = "boolean";
    }

    //switch typeAsString -> da bei literal type = value
    return {
      typeAsString,
      paramType: "literal",
      literalType: literalType,
    };
  }

  private handelEnumType(
    type: Type<ts.EnumType>,
    typeAsString: string
  ): TypeResource {
    try {
      const enumDecl = type.getSymbol()?.getDeclarations()?.[0];
      if (enumDecl && Node.isEnumDeclaration(enumDecl)) {
        const members = enumDecl.getMembers();
        const enumMembers = members.map((m) => m.getName());
        return { typeAsString, paramType: "enum", enumMembers: enumMembers };
      }
    } catch (err) {
      console.warn(`Error analyzing enum type ${typeAsString}: `, err);
      return {
        typeAsString,
        paramType: "enum",
        enumMembers: [],
        errorWarning: `Error: ${err}`,
      };
    }
    return { typeAsString, paramType: "enum", enumMembers: [] };
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
          isOptional: prop.isOptional?.() ?? false,
        });
      } catch (err) {
        console.warn(`Error analyzing object property ${prop.getName()}:`, err);
        paramArr.push({
          paramName: prop.getName(),
          typeInfo: {
            typeAsString: "unknown",
            paramType: "fallback",
            errorWarning: `Error: ${err}`,
          },
          isOptional: true,
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
    type: Type<ts.GenericType>,
    typeAsString: string,
    depth: number,
    visited: Set<string>
  ): TypeResource {
    const typeArgs = type.getTypeArguments();
    const symbol = type.getSymbol();
    const baseType = symbol ? symbol.getName() : typeAsString.split("<")[0];

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
}
