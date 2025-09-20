import type { InstancePropType } from "../backend/nodeVMResources";
import type { ClassResource } from "../backend/tsCompilerAPIResources";

// die methode Daten befinden sich schon im Frontend lediglich bestätigung der Funktionalität
export type InstanceCheckResponseType = {
  instanceName: string;
  isValid: boolean;
  props?: InstancePropType[];
  error?: Error;
};

//delete einer instance lediglich name benötigt
// ? ins.instanceName

//erhalt nach codeausführung einer methode inerhalb einer instance
export type CompiledMethodInInstanceResponseTyp = {
  instanceName: string;
  methodName: string;
  //unique über instanceName + methodeName + methodKind
  methodKind: "default" | "get" | "set";
  newProps?: InstancePropType[];
  isValid: boolean;
  returnValue?: string;
  error?: Error;
};

//wenn file aktualisierung angefordeert wird 
export type RefreshClassesRespondeType = {
  filePath: string;
  clsRes: ClassResource[];
};
