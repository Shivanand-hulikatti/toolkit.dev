import type { ServerToolConfig } from "@/toolkits/types";
import type { getListings } from "./base";
import { api } from "@/trpc/server";
import { refreshEtsyAccessToken} from "@/server/auth/custom-providers/etsy";


export const getListingsServerConfig = (

  ): ServerToolConfig<
  typeof getListings.inputSchema.shape,
  typeof getListings.outputSchema.shape
> => {
  return {
    callback: async () => {
      try {
        const account = await api.accounts.getAccountByProvider("etsy");
        const userID = account?.providerAccountId;
        const etsyUserId = Number(userID);
        const apiKey = process.env.AUTH_ETSY_ID;
        const refreshToken = account?.refresh_token;
        const accessExpiry = account?.expires_at;

        if (!apiKey) throw new Error("Missing AUTH_ETSY_ID");
        if (accessExpiry && refreshToken && userID && (accessExpiry < Date.now() / 1000)) {
          await refreshEtsyAccessToken(refreshToken, userID);
        }

        const accessToken = account?.access_token;
        if (!accessToken) throw new Error("Missing Etsy access token");


        const shopResponse = await fetch(
          `https://openapi.etsy.com/v3/application/users/${etsyUserId}/shops`,
          {
            headers: {
              "x-api-key": apiKey,
              Authorization: `Bearer ${accessToken}`,
            }
          },
        );

        const shop = (await shopResponse.json());

        const listingResponse = await fetch(
          `https://openapi.etsy.com/v3/application/shops/${shop.shop_id}/listings`,
          {
            headers: {
              "x-api-key": apiKey,
              Authorization: `Bearer ${accessToken}`,
            }
          },
        );
        const listings = (await listingResponse.json());

        // this is going to be very inefficient code for large shops, but let's do this for now. I can raise QPS ratelimits if needed
        // for each listing, fetch the images
        for (let i = 0; i < listings.results.length; i++) {
          const listing = listings.results[i];
          const imageResponse = await fetch(
            `https://openapi.etsy.com/v3/application/listings/${listing.listing_id}/images`,
            {
              headers: {
                "x-api-key": apiKey,
                Authorization: `Bearer ${accessToken}`,
              }
            },
          );
          const images = (await imageResponse.json());
          listing.images = images.results;
        }


        return {
          listings: listings,
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