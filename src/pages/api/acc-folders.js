import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { getFolderContents } = serverRuntimeConfig;

const handler = async (req, res) => {
  if (
    req.method !== "POST" ||
    req.body.path === undefined ||
    req.body.path === null ||
    req.body.hubId === undefined ||
    req.body.hubId === null ||
    req.body.projectId === undefined ||
    req.body.projectId === null
  ) {
    res.statusMessage = "{Bad Request}";
    res.status(404).send("Bad Request");
    return;
  }
  if (req.session.user === undefined) {
    res.statusMessage = "Unauthorized";
    res.status(401).send("Unauthorized");
    return;
  }

  const folderContents = await getFolderContents(
    req.body.hubId,
    req.body.projectId,
    req.body.path,
    ["folders"]
  );
  res.send(folderContents);
};

export default withSessionRoute(handler);
