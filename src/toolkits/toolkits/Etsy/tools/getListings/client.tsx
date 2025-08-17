import type { ClientToolConfig} from "@/toolkits/types";
import type { getListings } from "./base";

export const getListingsClientConfig: ClientToolConfig<
  typeof getListings.inputSchema.shape,
  typeof getListings.outputSchema.shape
> = {
  CallComponent: ({ args, isPartial }) => (
    <div className="flex items-center gap-2">
      <span>🔍</span>
      {isPartial && <span className="animate-pulse">...</span>}
    </div>
  ),
  ResultComponent: ({ args, result }) => (
    <div className="border rounded p-4">

    </div>
  )
};