//Klasse ohne export
class Testi_01 {
  constructor() {}
}

//Klasse mit export
export class Testi_02 {
  constructor() {}
}

//nachträglich exportierte Klassen
class Testi_03 {
  constructor() {}
}
export { Testi_03 };

//default exportierte Klassen
export default class Testi_04 {
  constructor() {}
}

