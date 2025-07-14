import * as ts from "typescript";

const fileNames = ["", ""];

interface DocEntry {
  name?: string;
  fileName?: string;
  documentation?: string;
  type?: string;
  constructors?: DocEntry[];
  parameters?: DocEntry[];
  returnType?: string;
}

//https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
export function findClasses(fileNames: string[], options: ts.CompilerOptions) {
  /*
  Wir benötigen zuerst ein Vollständiges TypeScript-Objekt um zu Laden und Parsen zu können.
  So stellt TypeScript selbst einen Syntax Baum zur verfügung. ein Abstraktes Syntaxbaum-Modell (AST)
  Ist dies nicht gegeben wäre es nur möglich das manuell zu machen, ohne bereits bestehende TypeInformationen.
  */
  // beide liefer direkt nutzbare Objekte, keine Promises (synchron)
  // -> Ein Compiler muss Quellcode vollständig, deterministisch und sequentiell analysieren.
  const program = ts.createProgram(fileNames, options);
  // Werkzeug zur TypeAnalyse
  /*
  Es gibt zwei Arten von Representatione neben nodes
  Symbols - zeigt wie das typ system die entety betrachtet wie Klassen, Funktionen, oder Varaiabele
  Type - Zeigt genauen Typen | bei function greet(){} -> () => void
  */
  let checker = program.getTypeChecker();

  let output: string[] = [];

  /*
  getSourceFiles() -> liefert alle gegebene TypeScript Quelldatein
  Liefert aber auch alle automatisch eingebunden und importierten/abhängigen .ts mit 
  */
  for (const sourceFile of program.getSourceFiles()) {
    // Filtert von eingebunden DAtein
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, visit);
    }
  }
  console.log("Output gegebener Dateien: ", JSON.stringify(output));

  function visit(node: ts.Node) {
    /**
     * * nur exportierete nodes betrachten, sonst return
     * * wollen wir ja eigentlich nicht aufteilen wir brauchen alle
     * ! if (isNodeExported(node)) {
     * ! return;
     * ! }
     */

    /**
     * Checkt ob node eine Klasse ist
     * Wenn nicht und ist Module gehe tiefer rein und rufe rekursiv wieder visit auf
     * Module - gemeint interen Namespaces in denen verschachtelt sich Klassen befinden können
     */
    if (ts.isClassDeclaration(node) && node.name) {
      let symbol = checker.getSymbolAtLocation(node.name);
      if (symbol) {
        output.push(symbol.getName());
      }
    } else if (ts.isModuleDeclaration(node)) {
      ts.forEachChild(node, visit);
    }
  }
}

// prüfung ob Node exportiert ist
/*
ts.getCombinedModifierFlags(node as ts.Declaration) - holt alle Modiefier (z. B. export, default, public, private) mit gültigen Declarations
ts.ModifierFlags.Export - prüft ob Flag export gesetzt ist
- !!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile - guckt ob toplevel sichtbar und nicht verschachtelt
*/
function isNodeExported(node: ts.Node): boolean {
  return (
    (ts.getCombinedModifierFlags(node as ts.Declaration) &
      ts.ModifierFlags.Export) !==
      0 ||
    (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
  );
}
