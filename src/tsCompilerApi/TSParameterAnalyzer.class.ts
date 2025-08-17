import { ParameterDeclaration, Type, Node, Symbol, Signature } from "ts-morph";
import {
  ParameterResource,
  TypeResource,
} from "../_resources/tsCompilerAPIResources";

export class TSParameterAnalyzer {
  private param: ParameterDeclaration | Symbol;
  private isSymbol: boolean = false;
  private signature?: Signature;

  constructor(param: ParameterDeclaration | Symbol, signature?: Signature) {
    this.param = param;
    this.signature = signature;

    this.isSymbol = !Node.isParameterDeclaration(param as any as Node);
  }

  /*
  private parseType(param: ParameterDeclaration): string {
    const typeNode = param.getTypeNode();
    return typeNode ? typeNode.getText() : param.getType().getText();
  }
  */

  //default param-analyser
  public paramAnalyzer(
    param: ParameterDeclaration | Symbol = this.param
  ): ParameterResource {
    if (!this.isSymbol) {
      const myParam = this.param as ParameterDeclaration;

      //bei param ganz normal weiter machen
      return {
        paramName: myParam.getName(),
        typeInfo: this.typeAnalyzer(myParam.getType()),
        optional: myParam.isOptional(),
      };
    } else {
      const myParam = this.param as Symbol;

      if (!this.signature) {
        throw new Error("signatur wird für arbeit mit symbol benötigt");
      }

      const paramName = myParam.getName();
      const paramType = myParam.getTypeAtLocation(
        this.signature.getDeclaration()
      );
      const isOptional = myParam.isOptional?.() ?? false;

      return {
        paramName: paramName,
        typeInfo: this.typeAnalyzer(paramType),
        optional: isOptional,
      };
    }
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

      //switch typeAsString -> da bei literal Value === type
      return {
        typeAsString,
        paramType: "literal",
        literalType: literalType,
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
        const propType = prop.getTypeAtLocation(
          // ! hier noch mal prüfen ob ich das so kann
          this.param as ParameterDeclaration
        );
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
