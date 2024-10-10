import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { getLastSyncTime } = serverRuntimeConfig;

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  const lastSyncTime = await getLastSyncTime();

  res.send(lastSyncTime);
};

export default withSessionRoute(handler);
