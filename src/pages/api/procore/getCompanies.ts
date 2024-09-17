// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { setProcoreTokensFromCompanyBody } from "@/lib/tokenHelper";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieToken = req.cookies.procore_token;
  if (!cookieToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = jwt.verify(cookieToken, process.env.JWT_SECRET!);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log(token);

  console.log(process.env.BASE_URL! + "/rest/v1.0/companies");

  fetch(process.env.BASE_URL! + "/rest/v1.0/companies", {
    headers: {
      // @ts-ignore
      Authorization: `Bearer ${token.access_token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        console.error(response);
        throw new Error("Failed to fetch companies");
      }
      return response.json();
    })
    .then((data) => {
      res.status(200).json(data);
      setProcoreTokensFromCompanyBody(data, token as any);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
}
