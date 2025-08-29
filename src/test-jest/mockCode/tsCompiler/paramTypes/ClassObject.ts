export class ClassObject {
  constructor(
    simpleObject: { name: string; age: number },
    complexObject: { name: string; age?: number; tags: string[] },
    nestedObject: {
      user: { name: string; email: string };
      settings: { theme: string };
    },
    recordType: Record<string, any>
  ) {}
}
