import path from "path";
import { Path } from "typescript";

export const giveMeTSResource = (fileName: string) => ({
  name: `${fileName}.ts`,
  path: path.resolve(
    __dirname,
    `./mockCode/tsCompiler/paramTypes/${fileName}.ts`
  ) as Path,
});
