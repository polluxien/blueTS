import ts from "typescript";
import { TsFileResource } from "../fileService/fileResources";
import {
  ClassRessource,
  ConstructorRessource,
  ParameterRessource,
} from "./tsCompilerAPIRessourcees";

export class TSClassAnalyzer {
  private program;
  private checker;
  private tsFiles: TsFileResource[];
  private classRessourceArr: ClassRessource[] = [];

  constructor(tsFiles: TsFileResource[], options: ts.CompilerOptions) {
    this.tsFiles = tsFiles;
    this.program = ts.createProgram(
      tsFiles.map((file) => file.path),
      options
    );
    this.checker = this.program.getTypeChecker();
  }

  public parse(): ClassRessource[] {
    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      //ts.sourceFile erbt von ts.Node und muss daher nicht gecasted werden
      ts.forEachChild(sourceFile, (node) => this.visit(node, sourceFile));
    }

    return this.classRessourceArr;
  }

  private visit(node: ts.Node, sourceFile: ts.SourceFile) {
    if (ts.isClassDeclaration(node) && node.name) {
      const tsFile = this.tsFiles.find(
        (file) => file.path == sourceFile.fileName
      );
      if (!tsFile) {
        console.error("SourceFile was not found again: ", sourceFile.fileName);
      }
      let symbol = this.checker.getSymbolAtLocation(node.name);
      if (symbol) {
        this.classRessourceArr.push({
          className: symbol.getName(),
          tsFile: tsFile!,
          constructor: this.extractConstructorRessource(symbol),
        });
      }
    } else if (ts.isModuleDeclaration(node)) {
      ts.forEachChild(node, (node) => this.visit(node, sourceFile));
    }
  }

  private extractConstructorRessource(
    symbol: ts.Symbol
  ): ConstructorRessource | undefined {
    const type = this.checker.getTypeOfSymbolAtLocation(
      symbol,
      symbol.valueDeclaration!
    );
    //ich gebe jetzt Array zurück mit allen Constructor-signaturen, kann ja auch überladen werden
    const signatures = type.getConstructSignatures();
    if (signatures.length === 0) return undefined;
    //ich nehm erst einmal nur die erste möglichkeit an Constructor
    const parameters: ParameterRessource[] | undefined =
      this.extractParameterRessource(signatures[0]);
    const returnType = this.checker.typeToString(signatures[0].getReturnType());
    return { parameters, returnType };
  }

  private extractParameterRessource(
    signature: ts.Signature
  ): ParameterRessource[] | undefined {
    const parameterRessourceArr: ParameterRessource[] = [];
    if (signature.parameters.length === 0) return undefined;
    for (let param of signature.parameters) {
      const decl = param.valueDeclaration!;
      const type = this.checker.getTypeOfSymbolAtLocation(param, decl);
      const optional = ts.isParameter(decl) && !!decl.questionToken;

      parameterRessourceArr.push({
        name: param.getName(),
        type: this.checker.typeToString(
          this.checker.getTypeOfSymbolAtLocation(param, param.valueDeclaration!)
        ),
        optional: optional,
      });
    }

    return parameterRessourceArr;
  }
}
