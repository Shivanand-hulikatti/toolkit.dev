import type { Etsy } from "etsy-ts";

import type { ServerToolConfig } from "@/toolkits/types";
import type { getListings } from "./base";

export const getListingsServerConfig = (
  etsy: Etsy,
): ServerToolConfig<
  typeof getListings.inputSchema.shape,
  typeof getListings.outputSchema.shape
> => {
  return {
    callback: async () => {
      try {
        const user = await etsy.User.getMe();

        const userId = user.data.user_id;

        if (!userId) throw new Error("Missing Etsy user ID");

        const shop = await etsy.Shop.getShopByOwnerUserId(userId);

        const shopId = shop.data.shop_id;

        if (!shopId) throw new Error("Missing Etsy shop ID");

        const listings = await etsy.ShopListing.getFeaturedListingsByShop({
          shopId,
        });

        if (!listings.data.results) throw new Error("Missing Etsy listings");

        return {
          results: listings.data.results,
        };
      } catch (error) {
        console.error("Etsy API error:", error);
        throw new Error("Failed to fetch listings from Etsy");
      }
    },
    message:
      "Successfully retrieved the Etsy listing. The user is shown the responses in the UI. Do not reiterate them. " +
      "If you called this tool because the user asked a question, answer the question.",
  };
};
