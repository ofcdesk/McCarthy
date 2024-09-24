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

  const server: Server = req.body.server;

  if (!server) {
    return res.status(400).json({ error: "Server not provided" });
  }

  if (!server.id) {
    server.id = Math.random().toString(36).substring(7);
  }

  const servers: Server[] = await getServers(
    Array.isArray(companyId) ? companyId[0] : companyId || ""
  );

  setServers(
    servers.concat(server),
    Array.isArray(companyId) ? companyId[0] : companyId || ""
  );

  res.status(200).json(servers.concat(server));
}
