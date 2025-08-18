import { z } from "zod";

import { EtsyTools } from "./tools/tools";

import { getListings } from "@/toolkits/toolkits/Etsy/tools/get-listings/base";

import type { ToolkitConfig } from "@/toolkits/types";

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
