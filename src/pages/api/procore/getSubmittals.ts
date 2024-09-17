// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

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

  const selectedProjectId = req.query.project_id;

  if (!selectedProjectId) {
    return res.status(400).json({ error: "No project_id provided" });
  }

  fetch(
    process.env.NEXT_PUBLIC_API_URL +
      "/api/procore/get-submittals?project_id=" +
      selectedProjectId +
      "&application_token=" +
      process.env.SIHUB_APPLICATION_TOKEN,
    {
      headers: {
        // @ts-ignore
        Authorization: `Bearer ${token.access_token}`,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to fetch submittals");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
}
