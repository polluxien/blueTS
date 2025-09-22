import type { PropInstanceType } from "../backend/nodeVMResources";
import type { MethodResource } from "../backend/tsCompilerAPIResources";

export type InstanceResource = {
  instanceName: string;
  className: string;
  props?: PropInstanceType[];
  methods: MethodResource[];
};
