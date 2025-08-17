import type { ServerToolConfig } from "@/toolkits/types";
import type { getListing } from "./base";
import { api } from "@/trpc/server";


export const getListingServerConfig = (

  ): ServerToolConfig<
  typeof getListing.inputSchema.shape,
  typeof getListing.outputSchema.shape
> => {
  return {
    callback: async () => {
      try {
        const account = await api.accounts.getAccountByProvider("etsy");
        const userID = account?.providerAccountId;
        const etsyUserId = Number(userID);
        const apiKey = process.env.AUTH_ETSY_ID;
        if (!apiKey) throw new Error("Missing AUTH_ETSY_ID");
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


        return {
          listings: listings,
        };
      } catch (error) {
        console.error("Etsy API error:", error);
        throw new Error("Failed to fetch listings from Etsy");
      }
    },
    message:
      "Successfully retrieved the Etsy listing. The user is shown the responses in the UI. Do not reiterate them. The user is shown the responses in the UI. " +
      "If you called this tool because the user asked a question, answer the question.",
  };
};