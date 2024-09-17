import type { NextApiRequest, NextApiResponse } from "next";

import { setConnections } from "@/lib/connectionHelper";
import type { ACCProject, Connection, ProcoreProject } from "@/pages";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const companyId = req.body.companyId;

  if (!companyId) {
    return res
      .status(400)
      .json({ error: "Company id not provided in the request" });
  }

  const connections: Connection[] = req.body.connections;

  if (!connections) {
    return res.status(400).json({ error: "Connections not provided" });
  }

  type DBConnection = {
    procoreProject: ProcoreProject;
    accProjects: ACCProject[];
  };

  const dbConnections: DBConnection[] = [];

  connections.forEach((connection) => {
    if (!connection.accProjects) {
      return res.status(400).json({ error: "ACC Project id not provided" });
    }

    if (!connection.procoreProject) {
      return res.status(400).json({ error: "Procore id not provided" });
    }

    dbConnections.push({
      accProjects: connection.accProjects,
      procoreProject: connection.procoreProject,
    });

    // const taskName = `${connection.procoreProject?.name} (${
    //   connection.procoreProject?.id
    // }) -> ${connection.accProjects
    //   ?.map(
    //     (accProj) =>
    //       accProj.attributes.name +
    //       " (" +
    //       accProj.id +
    //       ") (ACC) | (" +
    //       accProj.relationships.rfis.data.id +
    //       ") (RFI Container ID) | (" +
    //       accProj.relationships.submittals.data.id +
    //       ") (Submittal Container ID)"
    //   )
    //   .join(", ")}`;

    // connectionQueue.push(
    //   {
    //     name: taskName,
    //     ...connection,
    //   },
    //   (err) => {
    //     if (err) {
    //       console.error(`Error processing task ${taskName}:`, err);
    //     } else {
    //       // SUCCESS LOGIC
    //     }
    //   }
    // );
  });

  setConnections(dbConnections, companyId);

  res.status(200).json({ message: "Connections updated!" });
}
