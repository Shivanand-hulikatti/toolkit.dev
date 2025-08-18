import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";
import type { IShopListing } from "etsy-ts";

export const getListings = createBaseTool({
  description:
    "Fetches all listings from the Etsy shop associated with the authenticated user.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    results: z.array(z.custom<IShopListing>()),
  }),
});
