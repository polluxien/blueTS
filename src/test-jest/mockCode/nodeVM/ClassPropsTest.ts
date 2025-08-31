//Diese Klasse dient zum testen der richtigen Darstellung von prop values

type Gender = "male" | "female" | "other";

interface Address {
  street: string;
  houseNumber: number;
  postalCode: string;
  city: string;
}

class AllTheTypes<T = string> {
  // Primitive Types
  private id: number = 1;                                                 //0
  protected name: string = "Bennet";                                      //1
  public isActive: boolean = true;                                        //2
  rating: number | null = null;                                           //3
  public uuid?: string = "123e4567-e89b-12d3-a456-426614174000";          //4
  public nothing: undefined = undefined;                                  //5
  public anything: any = { foo: "bar" };                                  //6
  public unknownThing: unknown = 42;                                      //7

  // Literal Types & Unions
  public gender: Gender = "male";                                         //8
  public role: "admin" | "user" | "guest" = "user";                       //9

  // Special objects
  public birthDate: Date = new Date("2000-01-01");                        //10
  public address: Address = {
    street: "Musterstraße",
    houseNumber: 12,
    postalCode: "12345",
    city: "Berlin",
  };                                                                      //11

  // Arrays & Tuples
  public tags: string[] = ["example", "test", "sample"];                  //12
  public scores: number[] = [10, 20, 30];                                 //13
  public mixedTuple: [string, number, boolean] = ["Level", 5, true];      //14

  // Maps & Sets
  public preferences: Map<string, string> = new Map([["theme", "dark"]]); //15
  public uniqueIds: Set<number> = new Set([1, 2, 3]);                     //16

  // Functions
  public greet: (name: string) => string = (n) => `Hallo ${n}!`;          //17
  public action: () => void = () => console.log("Aktion ausgeführt");     //18

  // Generic Type
  public genericValue: T = "defaultValue" as T;                           //19

  // Static property
  static instanceCount: number = 0;                                       //20

  constructor() {
    AllTheTypes.instanceCount++;
  }
}