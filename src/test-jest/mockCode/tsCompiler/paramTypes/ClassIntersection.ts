interface User {
  name: string;
  email: string;
}

export class ClassIntersection {
  constructor(
    userWithId: User & { id: string },
    multipleIntersection: { name: string } & { age: number } & { email: string }
  ) {}
}