import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { getFileSyncStatus } = serverRuntimeConfig;

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  const currentSyncFile = await getFileSyncStatus();

  res.send(currentSyncFile);
};

export default withSessionRoute(handler);
