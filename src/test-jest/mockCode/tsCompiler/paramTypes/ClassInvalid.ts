export class ClassInvalid {
  constructor(
    // @ts-ignore - für Test mit problematischen Typen
    problematicType: any & never,
    // @ts-ignore
    impossibleUnion: string & number,
    unknownGeneric: SomeUnknownType<string>
  ) {}
}
