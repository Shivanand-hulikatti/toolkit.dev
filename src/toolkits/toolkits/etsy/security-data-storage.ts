import type { ISecurityDataStorage, SecurityDataFilter, Tokens } from "etsy-ts";
import { api } from "@/trpc/server";
import { etsyScopes } from "@/server/auth/custom-providers/etsy";

export class EtsySecurityDataStorage implements ISecurityDataStorage {
  async storeAccessToken(filter: SecurityDataFilter, accessToken: Tokens) {
    await api.accounts.updateAccount({
      provider: "etsy",
      providerAccountId: filter.etsyUserId.toString(),
      data: {
        access_token: accessToken.accessToken,
        refresh_token: accessToken.refreshToken,
        token_type: accessToken.tokenType,
        expires_at: accessToken.expiresIn + Date.now() / 1000,
        scope: etsyScopes,
      },
    });
  }

  async findAccessToken(): Promise<Tokens | undefined> {
    const account = await api.accounts.getAccountByProvider("etsy");
    if (
      !account?.access_token ||
      !account.refresh_token ||
      !account.token_type ||
      !account.expires_at
    )
      return undefined;

    return {
      accessToken: account.access_token,
      refreshToken: account.refresh_token,
      tokenType: account.token_type,
      expiresIn: account.expires_at - Date.now() / 1000,
    };
  }
}
