interface NodeA {
  value: string;
  nodeB: NodeB;
}

interface NodeB {
  value: number;
  nodeA: NodeA;
}

export class ClassCircular {
  constructor(circularRef: NodeA) {}
}
