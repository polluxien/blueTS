import {
  EnumParamType,
  InstanceParamType,
  RestParamType,
  SpecailLockedType,
} from "../../_resources/nodeVMResources";
import { getInstanceFromInstanceMap } from "./instanceManager";

const isInstanceParamType = (param: any): param is InstanceParamType => {
  return (
    typeof param.className === "string" &&
    typeof param.instanceName === "string"
  );
};

const isRestParamType = (param: any): param is RestParamType => {
  return param !== null && Array.isArray(param.restParams);
};

const isEnumParamType = (param: any): param is EnumParamType => {
  return (
    typeof param.enumValue === "string" && typeof param.enumMembers === "object"
  );
};

const isSpecialLockedType = (param: any): param is SpecailLockedType => {
  return (
    param.specialLockedType === "null" ||
    param.specialLockedType === "undefined"
  );
};

export function normalizeParam(param: any): any[] {

  if (isInstanceParamType(param)) {
    const ins = getInstanceFromInstanceMap(param.instanceName);
    return [ins];
  }

  // * eventuell im context noch erstellen
  if (isEnumParamType(param)) {
    return [param.enumValue];
  }

  if (isSpecialLockedType(param)) {
    return param.specialLockedType === "null" ? [null] : [undefined];
  }

  if (isRestParamType(param)) {
    return param.restParams;
  }

  return [param];
}
