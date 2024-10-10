import { withSessionRoute } from "lib/withSession";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();
const { getSynchronizationConfig } = serverRuntimeConfig;

const handler = async (req, res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.send({});
    return;
  }

  const synchronizationConfig = await getSynchronizationConfig();

  res.send(synchronizationConfig);
};

export default withSessionRoute(handler);
