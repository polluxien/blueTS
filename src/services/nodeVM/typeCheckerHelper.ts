import {
  EnumParamType,
  GenericType,
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

const isGenericType = (param: any): param is GenericType => {
  return (
    param.genericType === "map" ||
    param.genericType === "set" ||
    param.genericType === "promise"
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

  if (isGenericType(param)) {
    switch (param.genericType) {
      case "map":
        return [createMap(param)];
      case "set":
        return [createSet(param)];
      case "promise":
        return [createPromise(param)];
    }
  }

  if (isRestParamType(param)) {
    return param.restParams;
  }

  return [param];
}

function createMap(param: any): Map<unknown, unknown> {
  if (!param.entries || !Array.isArray(param.entries)) {
    console.error("Invalid map param:", param);
    return new Map();
  }

  return new Map(param.entries);
}

function createSet(param: any): Set<unknown> {
  if (!param.values || !Array.isArray(param.values)) {
    console.error("Invalid set param:", param);
    return new Set();
  }

  return new Set(param.values);
}

function createPromise(param: any): Promise<unknown> {
  if (param.status === "fulfilled" || param.status === "resolved") {
    return Promise.resolve(param.value);
  } else if (param.status === "rejected") {
    return Promise.reject(new Error(param.error || "Promise rejected"));
  } else {
    return Promise.resolve(param.value);
  }
}
