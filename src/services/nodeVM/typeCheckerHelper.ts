import {
  EnumParamType,
  InstanceParamType,
  RestParamType,
} from "../../_resources/nodeVMResources";
import { getInstanceFromInstanceMap } from "./instanceManager";

const isInstanceParamType = (param: any): param is InstanceParamType => {
  return (
    typeof param === "object" &&
    typeof param.className === "string" &&
    typeof param.instanceName === "string"
  );
};

const isRestParamType = (param: any): param is RestParamType => {
  return (
    typeof param === "object" &&
    param !== null &&
    Array.isArray(param.restParams)
  );
};

const isEnumParamType = (param: any): param is EnumParamType => {
  return (
    typeof param === "object" &&
    typeof param.enumValue === "string" &&
    typeof param.enumMembers === "object"
  );
};

export function normalizeParam(param: any): any[] {
  if (typeof param !== "object") {
    return param;
  }

  if (isInstanceParamType(param)) {
    const ins = getInstanceFromInstanceMap(param.instanceName);
    return [ins];
  }

  // * eventuell im context noch erstellen 
  if (isEnumParamType(param)) {
    return [param.enumValue];
  }

  if (isRestParamType(param)) {
    return param.restParams;
  }

  return [param];
}
