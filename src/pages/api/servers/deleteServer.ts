import type { NextApiRequest, NextApiResponse } from "next";

import { getServers, setServers } from "@/lib/serverHelper";
import { Server } from "@/pages/ftp-servers";

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

  const server = req.body.server;

  const servers: Server[] = await getServers(
    Array.isArray(companyId) ? companyId[0] : companyId || ""
  );

  setServers(
    servers.filter((s) => s.id !== server.id),
    Array.isArray(companyId) ? companyId[0] : companyId || ""
  );

  res.status(200).json(servers.filter((s) => s.id !== server.id));
}
