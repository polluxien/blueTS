class Person {
  private _age: number;

  constructor(public name: string, age: number) {
    this._age = age;
  }

  // get
  get age(): number {
    return this._age;
  }

  // set
  set age(value: number) {
    if (value < 0) {
      throw new Error("Alter darf nicht negativ sein.");
    }
    this._age = value;
  }

  // normal
  greet(greeting: string): string {
    return `Hallo ${greeting}, mein Name ist ${this.name}.`;
  }

  // async
  async fetchData(): Promise<string> {
    // Simuliere einen Async-Call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Daten erfolgreich geladen!");
      }, 100);
    });
  }
}
