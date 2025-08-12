import { ParameterDeclaration, Type, Node } from "ts-morph";
import { ParameterResource, TypeResource } from "../_resources/tsCompilerAPIResources";

export class TSParameterAnalyzer {
  constructor(private param: ParameterDeclaration) {}

  /*
  private parseType(param: ParameterDeclaration): string {
    const typeNode = param.getTypeNode();
    return typeNode ? typeNode.getText() : param.getType().getText();
  }
  */


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

  private isBasicType(type: Type): boolean {
    return type.isString() || type.isNumber() || type.isBoolean();
  }

  //default type-analyser (eine Ebene Tiefer)
  private typeAnalyzer(type: Type): TypeResource {
    const typeAsString = type.getText();
    //console.log(typeAsString + ", " + type.isNullable().toString());

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

    if (
      type.isStringLiteral() ||
      type.isNumberLiteral() ||
      type.isBigIntLiteral() ||
      type.isBooleanLiteral()
    ) {
      return {
        typeAsString,
        paramType: "literal",
        //  literalValue: type.getLiteralValue(),
      };
    }

    if (type.isEnum()) {
      const enumDecl = type.getSymbol()?.getDeclarations()?.[0];
      if (enumDecl && Node.isEnumDeclaration(enumDecl)) {
        const members = enumDecl.getMembers();
        const enumValues = members.map((m) => m.getName());
        return { typeAsString, paramType: "enum", enumValues };
      }
      return { typeAsString, paramType: "enum", enumValues: [] };
    }

    //array
    if (type.isArray()) {
      return {
        typeAsString,
        paramType: "array",
        arrayType: this.typeAnalyzer(type.getArrayElementTypeOrThrow()),
      };
    }

    // ! Problem bei union null und undefined werden raus gefiltert schon bei typeAsString und werden nicht als option gewertet
    if (type.isUnion() && !type.isBoolean()) {
      const booleanLiterals: Type[] = [];
      const otherTypes: Type[] = [];

      /*
      type.getUnionTypes().map((unionType, index) => {
        console.log(
          `unionType ${typeAsString} on index ${index}: ${unionType.getText()}`
        );
      });
      */

      // Boolean von anderen typen trennen, da boolean selbst union und sonst true und false
      type.getUnionTypes().forEach((unionType) => {
        const typeText = unionType.getText();
        if (
          unionType.isBooleanLiteral() &&
          (typeText === "true" || typeText === "false")
        ) {
          booleanLiterals.push(unionType);
        } else {
          otherTypes.push(unionType);
        }
      });

      const unionValues: TypeResource[] = [];

      otherTypes.forEach((unionType) => {
        unionValues.push(this.typeAnalyzer(unionType));
      });

      // wenn true und false vorkommt füge boolean hinzu
      if (booleanLiterals.length === 2) {
        unionValues.push({
          typeAsString: "boolean",
          paramType: "basic",
        });
        // sonst übertarage als literal type
      } else if (booleanLiterals.length === 1) {
        const literalType = booleanLiterals[0];
        unionValues.push({
          typeAsString: literalType.getText(),
          paramType: "literal",
        });
      }

      /*
      if (type.isUndefined()) {
        unionValues.push({
          typeAsString: "undefined",
          paramType: "undefined",
        });
      }

      if (type.isNull()) {
        unionValues.push({
          typeAsString: "null",
          paramType: "null",
        });
      }
        */

      return {
        typeAsString,
        paramType: "union",
        unionValues,
      };
    }

    if (type.isTuple()) {
      return {
        typeAsString,
        paramType: "tuple",
        tupleElements: type.getTupleElements().map((t) => this.typeAnalyzer(t)),
      };
    }

    //function type
    if (type.getCallSignatures().length > 0) {
      return {
        typeAsString,
        paramType: "function",
      };
    }

    if (type.isClass()) {
      return {
        typeAsString,
        paramType: "instance",
      };
    }

    if (type.isObject()) {
      const props = type.getProperties();

      const paramArr: ParameterResource[] = [];
      for (let prop of props) {
        const propType = prop.getTypeAtLocation(this.param);
        paramArr.push({
          paramName: prop.getName(),
          typeInfo: this.typeAnalyzer(propType),
          optional: prop.isOptional?.() ?? false,
        });
      }
      return {
        typeAsString,
        paramType: "object",
        objectParameters: paramArr,
      };
    }

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

    //default Fallback
    return {
      typeAsString,
      paramType: "unknown",
    };
  }
}
