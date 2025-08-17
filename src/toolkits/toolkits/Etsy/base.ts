import { z } from "zod";
import type { ToolkitConfig } from "@/toolkits/types";
import { EtsyTools } from "./tools/tools";
import { getListings } from "@/toolkits/toolkits/Etsy/tools/getListings/base";

export const etsyParameters = z.object({});

export const baseEtsyToolkitConfig: ToolkitConfig<
  EtsyTools,
  typeof etsyParameters.shape
> = {
  tools: {
    [EtsyTools.getListings]: getListings,
  },
  parameters: etsyParameters,
};
