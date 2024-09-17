// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { token } from "@procore/js-sdk";
import type { NextApiRequest, NextApiResponse } from "next";

import jsonwebtoken from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "No code provided" });
  }

  const procoreToken = await token(
    {
      code,
      id: process.env.CLIENT_ID!,
      secret: process.env.CLIENT_SECRET!,
      uri: process.env.REDIRECT_URI!,
    },
    {
      apiHostname: process.env.API_HOSTNAME! as string,
    }
  );

  const jwt = jsonwebtoken.sign(
    procoreToken,
    process.env.JWT_SECRET! as string
  );

  if (!jwt || typeof jwt !== "string") {
    return res.status(500).json({ error: "Failed to create JWT" });
  }

  res.setHeader(
    "Set-Cookie",
    `procore_token=${jwt}; Secure; SameSite=None; Path=/; Max-Age=${procoreToken.expires_in}`
  );

  res.redirect("/");
}
