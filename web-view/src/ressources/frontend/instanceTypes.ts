import type { CompiledPropInstanceType } from "../backend/nodeVMResources";
import type { MethodResource, PropertyResource } from "../backend/tsCompilerAPIResources";

export type InstanceResource = {
  instanceName: string;
  className: string;
  properties: PropertyResource[]
  compiledProperties?: CompiledPropInstanceType[];
  methods: MethodResource[];
};
