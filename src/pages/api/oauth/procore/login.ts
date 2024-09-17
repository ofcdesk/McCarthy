// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { oauthServerOptions } from "@/lib/procoreUtils";
import { authorize } from "@procore/js-sdk";
import { redirect } from "next/dist/server/api-utils";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const procoreToken = authorize(
    {
      clientId: process.env.CLIENT_ID!,
      uri: process.env.REDIRECT_URI!,
    },
    oauthServerOptions
  );

  redirect(res, procoreToken);
}
