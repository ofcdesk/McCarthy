import type { NextApiRequest, NextApiResponse } from "next";

import { setServers } from "@/lib/serverHelper";
import { Server } from "@/pages/ftp-servers";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const companyId = req.body.companyId;

  if (!companyId) {
    return res
      .status(400)
      .json({ error: "Company id not provided in the request" });
  }

  const servers: Server[] = req.body.servers;

  if (!servers) {
    return res.status(400).json({ error: "Servers not provided" });
  }

  setServers(
    servers,
    Array.isArray(companyId) ? companyId[0] : companyId || ""
  );

  res.status(200).json({ message: "Servers updated!" });
}
