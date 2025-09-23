import { createContext } from "react";
import { vscode } from "./vscodeAPI.ts";

// Context exportieren
export const VscodeContext = createContext(vscode);
export { vscode };