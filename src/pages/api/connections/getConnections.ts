import type { NextApiRequest, NextApiResponse } from "next";

import { getConnections } from "@/lib/connectionHelper";
import type { Connection } from "@/pages";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const companyId = req.query.companyId;

  if (!companyId) {
    return res
      .status(400)
      .json({ error: "Company id not provided in the request" });
  }

  const connections: Connection[] = await getConnections(
    Array.isArray(companyId) ? companyId[0] : companyId || ""
  );

  res.status(200).json(connections);
}
