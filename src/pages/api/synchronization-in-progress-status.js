import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { getSyncStatus } = serverRuntimeConfig;

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }
  const synchronizationStatus = await getSyncStatus();

  res.send(synchronizationStatus);
};

export default withSessionRoute(handler);
