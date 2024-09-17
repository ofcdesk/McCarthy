// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieToken = req.cookies.acc_token;
  if (!cookieToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = jwt.verify(cookieToken, process.env.JWT_SECRET!);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  fetch(
    process.env.NEXT_PUBLIC_API_URL_DOMAIN! +
      "/api/acc/v2/get-specs/" +
      req.query.project_id +
      "?application_token=" +
      process.env.SIHUB_APPLICATION_TOKEN!,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // @ts-ignore
        Authorization: token.tk,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to fetch specs");
      }
      return response.json();
    })
    .then((data) => {
      // console.log(data);
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
}
