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

  const selectedCompanyId = req.query.company_id;

  if (!selectedCompanyId) {
    return res.status(400).json({ error: "No company_id provided" });
  }

  fetch(
    process.env.NEXT_PUBLIC_API_URL +
      "/api/procore/create-submittal?company_id=" +
      selectedCompanyId +
      "&project_id=" +
      selectedProjectId +
      "&application_token=" +
      process.env.SIHUB_APPLICATION_TOKEN,
    {
      method: "POST",
      headers: {
        // @ts-ignore
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    }
  )
    .then((response) => {
      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to create submittal");
      }

      console.log("status", response.status);
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
