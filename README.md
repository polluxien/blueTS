# blueTS

**blueTS** ist eine VS Code Extension, die TypeScript-Code direkt in VS Code ausführbar macht - ohne separate Build-Schritte oder Terminal-Befehle. Perfekt für schnelles Prototyping, Testing und interaktive TypeScript-Entwicklung.

## Features

- **Direkte Code-Ausführung**: TypeScript-Dateien mit einem Klick ausführen
- **Interaktive UI für Funktionsaufrufe**: Generiert automatisch Formulare für TypeScript-Funktionen mit allen Eingabe-Parametern
- **Intelligente Type-Validierung**: Unterstützt primitive Typen, Enums, Klassen, Generics (Map, Set, Promise, Record), Arrays, Tuples, Union-Types, Intersection-Types und verschachtelte Objekte
- **Klassen-Instanzen Management**: Erstelle und verwalte Klasseninstanzen direkt in der UI
- **Methoden-Aufruf Interface**: Rufe Methoden auf erstellten Instanzen über generierte Formulare auf
- **Live Type-Checking**: Echtzeit-Validierung während der Eingabe

## Requirements

- Visual Studio Code Version 1.60.0 oder höher
- Node.js (für die TypeScript-Kompilierung im Hintergrund)

## Installation

1. Lade die `.vsix` Datei herunter
2. Öffne VS Code
3. Gehe zu Extensions (Cmd+Shift+X / Ctrl+Shift+X)
4. Klicke auf "..." → "Install from VSIX..."
5. Wähle die heruntergeladene `.vsix` Datei

## Usage

1. Öffne eine TypeScript-Datei
2. Die Extension analysiert automatisch alle exportierten Funktionen und Klassen
3. Nutze die generierte UI um:
   - Funktionen mit Parametern aufzurufen
   - Klassen-Instanzen zu erstellen
   - Methoden auf Instanzen auszuführen

### Beispiel

```typescript
export function sum(a: number, b: number): number {
  return a + b;
}

export class Calculator {
  constructor(private initialValue: number) {}
  
  add(value: number): number {
    return this.initialValue + value;
  }
}
```

Die Extension generiert automatisch UI-Formulare für beide - `calculateSum` und `Calculator`.

## Supported Types

- **Primitive**: string, number, boolean, bigint, symbol
- **Special**: null, undefined, void, never
- **Complex**: Array, Set, Map, Record, Promise
- **Custom**: Enums, Classes, Interfaces (als Objects)
- **Advanced**: Union Types, Intersection Types, Tuples, Generics

## Release Notes

### 0.0.1

Initial release von blueTS:
- Grundlegende Funktion zum Ausführen von TypeScript-Code
- UI-Generierung für Funktionsparameter
- Klassen-Instanzen Management
- Type-Validierung für primitive und komplexe Typen

---

**Entwickelt von Bennet Worrmann**
