import { Search } from "lucide-react";
import type { ClientToolConfig } from "@/toolkits/types";
import type { getListings } from "./base";

export const getListingsClientConfig: ClientToolConfig<
  typeof getListings.inputSchema.shape,
  typeof getListings.outputSchema.shape
> = {
  CallComponent: ({ isPartial }) => (
    <div className="flex items-center gap-2">
      <Search className="h-4 w-4" />
      {isPartial && <span className="animate-pulse">...</span>}
    </div>
  ),
  ResultComponent: ({ result: { results } }) =>
    results.length > 0 ? (
      <div className="space-y-2">
        <h2 className="text-lg font-bold">Listings</h2>
        {results.map((listing) => (
          <div key={listing.listing_id}>{listing.title}</div>
        ))}
      </div>
    ) : (
      <h2>No listings found</h2>
    ),
};
