import { env } from "@/env";
import { db } from "@/server/db";

import type { OAuth2Config, OAuthUserConfig } from "next-auth/providers";

export interface EtsyProfile {
  user_id: number;
  primary_email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url_75x75?: string | null;
}

export default function EtsyProvider<P extends EtsyProfile>(
  options: OAuthUserConfig<P>,
): OAuth2Config<P> {
  return {
    id: "etsy",
    name: "Etsy",
    type: "oauth",
    clientId: options.clientId,
    clientSecret: options.clientId,
    authorization: {
      url: "https://www.etsy.com/oauth/connect",
      params: {
        scope: "email_r listing_r",
        state: Math.random().toString(36).substring(2, 15),
      },
    },
    token: {
      url: "https://openapi.etsy.com/v3/public/oauth/token",
      params: {
        client_id: env.AUTH_ETSY_ID,
      },
    },
    client: { token_endpoint_auth_method: "none" },
    userinfo: {
      url: "https://openapi.etsy.com/v3/application/users/me",
      async request({ tokens }: { tokens: { access_token: string } }) {
        const userId = parseInt(tokens.access_token.split(".")[0]!);

        const response = await fetch(
          `https://api.etsy.com/v3/application/users/${userId}`,
          {
            headers: {
              "x-api-key": env.AUTH_ETSY_ID,
              Authorization: `Bearer ${tokens.access_token}`,
            },
          },
        );

        return (await response.json()) as EtsyProfile;
      },
    },
    profile(profile) {
      return {
        id: profile.user_id.toString(),
        name: profile.first_name,
        email: profile.primary_email,
        image: profile.image_url_75x75,
      };
    },
    options,
  };
}

export async function refreshEtsyAccessToken(
  refreshToken: string,
  providerAccountId: string,
) {
  const response = await fetch("https://api.etsy.com/v3/public/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.AUTH_ETSY_ID!, // your app's client_id
      refresh_token: refreshToken, // the one you stored
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to refresh Etsy access token");
  }
  const tokens = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expires_at: number;
  };

  await db.account.update({
    where: {
      provider_providerAccountId: {
        provider: "etsy",
        providerAccountId: providerAccountId,
      },
    },
    data: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expires_at: tokens.expires_at,
    },
  });
}
