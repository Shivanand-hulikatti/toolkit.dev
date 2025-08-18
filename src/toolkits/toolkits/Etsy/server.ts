import { createServerToolkit } from "../../create-toolkit";
import { baseEtsyToolkitConfig } from "./base";
import { EtsyTools } from "./tools/tools";
import { getListingsServerConfig } from "@/toolkits/toolkits/Etsy/tools/get-listings/server";
import { api } from "@/trpc/server";
export const etsyToolkitServer = createServerToolkit(
  baseEtsyToolkitConfig,
  "You have access to the Etsy toolkit for general account management. Currently, this toolkit provides:\n" +
    "- **Get Listings**: Retrieves all listings and their image URLs associated with the shop associated with the signed-in user.\n\n",
  async () => {
    const account = await api.accounts.getAccountByProvider("etsy");

    if (!account) {
      throw new Error("No Etsy account found");
    }
    if (!account.access_token) {
      throw new Error("No Etsy access token found");
    }

    return {
      [EtsyTools.getListings]: getListingsServerConfig(),
    };
  },
);
