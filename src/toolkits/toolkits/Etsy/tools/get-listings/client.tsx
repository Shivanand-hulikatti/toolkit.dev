import type { ClientToolConfig } from "@/toolkits/types";
import type { getListings } from "./base";

export const getListingsClientConfig: ClientToolConfig<
  typeof getListings.inputSchema.shape,
  typeof getListings.outputSchema.shape
> = {
  CallComponent: ({ isPartial }) => (
    <div className="flex items-center gap-2">
      <span>🔍</span>
      {isPartial && <span className="animate-pulse">...</span>}
    </div>
  ),
  ResultComponent: ({ result }) => (
    <div className="rounded border p-4">
      {result.results.map((listing) => (
        <div key={listing.listing_id}>{listing.title}</div>
      ))}
    </div>
  ),
};
